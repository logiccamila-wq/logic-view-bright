export default async function handler(req: any, res: any) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const aiKey = process.env.AI_PROVIDER_KEY || process.env.AI_GATEWAY_API_KEY || "";
  const aiModel = process.env.AI_PROVIDER_MODEL || "gpt-4o-mini";
  const aiEndpoint = process.env.AI_PROVIDER_ENDPOINT || "https://api.openai.com/v1/chat/completions";
  const googleAiKey = process.env.GOOGLE_AI_API_KEY || "";
  const googleAiModel = process.env.GOOGLE_AI_MODEL || "gemini-2.0-flash";
  const providerPref = (process.env.AI_PROVIDER || "auto").toLowerCase().trim();
  const allowedRoles = (process.env.AI_ALLOWED_ROLES || "admin,finance,logistics_manager").split(',').map(s=>s.trim()).filter(Boolean);
  const dailyDefault = parseInt(process.env.AI_DAILY_LIMIT_DEFAULT || "50");
  const dailyAdmin = parseInt(process.env.AI_DAILY_LIMIT_ADMIN || String(dailyDefault));
  const dailyFinance = parseInt(process.env.AI_DAILY_LIMIT_FINANCE || String(dailyDefault));
  const dailyLogMgr = parseInt(process.env.AI_DAILY_LIMIT_LOGISTICS_MANAGER || String(dailyDefault));
  const costIn = parseFloat(process.env.AI_COST_INPUT || "0");
  const costOut = parseFloat(process.env.AI_COST_OUTPUT || "0");
  if (!supabaseUrl || !serviceKey) { res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }); return; }
  if (!aiKey && !googleAiKey) { res.status(501).json({ error: "AI provider not configured. Set AI_PROVIDER_KEY or GOOGLE_AI_API_KEY." }); return; }

  const authHeader = req.headers?.authorization || req.headers?.Authorization || "";
  if (!authHeader || !authHeader.toString().startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const accessToken = authHeader.toString().replace(/^Bearer\s+/i, "");

  try {
    const hSR: Record<string,string> = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
    const uResp = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${accessToken}`, apikey: serviceKey } });
    if (!uResp.ok) { res.status(401).json({ error: "Invalid session", detail: await uResp.text() }); return; }
    const userJson: any = await uResp.json().catch(()=>({}));
    const uid = userJson?.id || userJson?.user?.id || "";
    const email = userJson?.email || userJson?.user?.email || "";
    if (!uid) { res.status(401).json({ error: "Invalid user" }); return; }

    const rolesResp = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${uid}&select=role`, { headers: hSR });
    let roles: string[] = [];
    if (rolesResp.ok) {
      const rows: any[] = await rolesResp.json().catch(()=>[]);
      roles = rows.map(r=>r.role).filter(Boolean);
    }
    const isAllowed = roles.some(r => allowedRoles.includes((r||"").trim())) || email === "logiccamila@gmail.com";
    if (!isAllowed) { res.status(403).json({ error: "forbidden" }); return; }

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayIso = new Date(today.getTime() - today.getTimezoneOffset()*60000).toISOString();
    const usageResp = await fetch(`${supabaseUrl}/rest/v1/ai_usage?user_id=eq.${uid}&created_at=gte.${todayIso}&select=id`, { headers: hSR });
    let used = 0;
    if (usageResp.ok) {
      const js: any[] = await usageResp.json().catch(()=>[]);
      used = Array.isArray(js) ? js.length : 0;
    }
    const maxDaily = roles.includes('admin') ? dailyAdmin : roles.includes('finance') ? dailyFinance : roles.includes('logistics_manager') ? dailyLogMgr : dailyDefault;
    if (used >= maxDaily) { res.status(429).json({ error: "limit_reached" }); return; }

    let body: any = req.body || {};
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const task = (body.task || body.query || body.prompt || "").toString().trim();
    const context = body.context || {};
    if (!task) { res.status(400).json({ error: "task required" }); return; }

    // Extract optimization and risk slider values from context
    const optimization = typeof context.optimization === "number" ? Math.max(0, Math.min(100, context.optimization)) : 50;
    const risk = typeof context.risk === "number" ? Math.max(0, Math.min(100, context.risk)) : 50;

    const OPT_HIGH = 75;
    const OPT_LOW = 40;
    const RISK_HIGH = 75;
    const RISK_LOW = 40;

    const optStrategy = optimization >= OPT_HIGH
      ? "O nível de otimização é ALTO: priorize visão agressiva de crescimento, expansão e recomendações ousadas."
      : optimization >= OPT_LOW
        ? "O nível de otimização é MODERADO: sugira melhorias graduais e eficiência operacional equilibrada."
        : "O nível de otimização é BAIXO: priorize redução de custos, cortes inteligentes e preservação de caixa.";

    const riskStrategy = risk >= RISK_HIGH
      ? "O nível de risco aceito é ALTO: recomende expansão agressiva, projeções ousadas e investimentos de alto retorno."
      : risk >= RISK_LOW
        ? "O nível de risco aceito é MODERADO: sugira ações com risco calculado e crescimento sustentável."
        : "O nível de risco aceito é BAIXO: recomende ações conservadoras, proteção de caixa e foco em estabilidade.";

    const systemContent = `You are the ERP Vision Pilot AI core. Answer concisely and avoid extra tokens.
${optStrategy}
${riskStrategy}
Optimization slider: ${optimization}%. Risk slider: ${risk}%.
Tailor all recommendations to reflect these parameters.`;

    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: task + (Object.keys(context||{}).length ? `\n\nContext: ${JSON.stringify(context)}` : "") }
    ];

    let content = "";
    let tokensIn = 0;
    let tokensOut = 0;
    let usedProvider = "openai";

    // Determine provider: "azure", "google", "openai", or "auto"
    const useGoogle = providerPref === "google" || providerPref === "gemini" || (providerPref === "auto" && !aiKey && googleAiKey);
    const useOpenAI = !useGoogle && aiKey;

    if (useGoogle && googleAiKey) {
      // Google AI Studio (Gemini) call
      const geminiContents = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");

      const geminiBody: Record<string, unknown> = {
        contents: geminiContents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
      };
      if (systemText) {
        geminiBody.systemInstruction = { parts: [{ text: systemText }] };
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleAiModel}:generateContent`;
      const aiResp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": googleAiKey },
        body: JSON.stringify(geminiBody),
      });

      if (!aiResp.ok) {
        // If Google fails and OpenAI is available, try OpenAI as fallback
        if (aiKey && providerPref === "auto") {
          const fallbackResp = await fetch(aiEndpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: aiModel, messages, max_tokens: 200, temperature: 0.2 })
          });
          if (!fallbackResp.ok) { res.status(fallbackResp.status).send(await fallbackResp.text()); return; }
          const fallbackJson: any = await fallbackResp.json().catch(()=>({}));
          content = fallbackJson?.choices?.[0]?.message?.content || "";
          const u = fallbackJson?.usage || {};
          tokensIn = u?.prompt_tokens || 0;
          tokensOut = u?.completion_tokens || 0;
          usedProvider = "openai";
        } else {
          res.status(aiResp.status).send(await aiResp.text()); return;
        }
      } else {
        const aiJson: any = await aiResp.json().catch(()=>({}));
        content = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const meta = aiJson?.usageMetadata || {};
        tokensIn = meta?.promptTokenCount || 0;
        tokensOut = meta?.candidatesTokenCount || 0;
        usedProvider = "google-ai";
      }
    } else if (useOpenAI && aiKey) {
      // OpenAI / Azure OpenAI call (original behavior)
      const aiResp = await fetch(aiEndpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: aiModel, messages, max_tokens: 200, temperature: 0.2 })
      });

      if (!aiResp.ok) {
        // If OpenAI fails and Google is available, try Google as fallback
        if (googleAiKey && providerPref === "auto") {
          const geminiContents = messages
            .filter(m => m.role !== "system")
            .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
          const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
          const geminiBody: Record<string, unknown> = {
            contents: geminiContents,
            generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
          };
          if (systemText) geminiBody.systemInstruction = { parts: [{ text: systemText }] };

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleAiModel}:generateContent`;
          const fallbackResp = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": googleAiKey },
            body: JSON.stringify(geminiBody),
          });
          if (!fallbackResp.ok) { res.status(fallbackResp.status).send(await fallbackResp.text()); return; }
          const fallbackJson: any = await fallbackResp.json().catch(()=>({}));
          content = fallbackJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const meta = fallbackJson?.usageMetadata || {};
          tokensIn = meta?.promptTokenCount || 0;
          tokensOut = meta?.candidatesTokenCount || 0;
          usedProvider = "google-ai";
        } else {
          res.status(aiResp.status).send(await aiResp.text()); return;
        }
      } else {
        const aiJson: any = await aiResp.json().catch(()=>({}));
        content = aiJson?.choices?.[0]?.message?.content || "";
        const usage = aiJson?.usage || {};
        tokensIn = usage?.prompt_tokens || 0;
        tokensOut = usage?.completion_tokens || 0;
        usedProvider = "openai";
      }
    } else {
      res.status(501).json({ error: "No AI provider key configured" }); return;
    }

    const cost = ((tokensIn/1000) * costIn) + ((tokensOut/1000) * costOut);
    await fetch(`${supabaseUrl}/rest/v1/ai_usage`, {
      method: "POST",
      headers: { ...hSR, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: uid, role: (roles[0]||null), task, tokens_in: tokensIn, tokens_out: tokensOut, cost_usd: Number.isFinite(cost) ? Number(cost.toFixed(4)) : 0 })
    });

    res.status(200).json({ ok: true, user_id: uid, output: content, provider: usedProvider, usage: { prompt_tokens: tokensIn, completion_tokens: tokensOut }, cost_usd: Number.isFinite(cost) ? Number(cost.toFixed(4)) : 0 });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "ai_failed" });
  }
}
