export default async function handler(req: any, res: any) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const aiKey = process.env.AI_PROVIDER_KEY || process.env.AI_GATEWAY_API_KEY || "";
  const aiModel = process.env.AI_PROVIDER_MODEL || "gpt-4o-mini";
  const aiEndpoint = process.env.AI_PROVIDER_ENDPOINT || "https://api.openai.com/v1/chat/completions";
  const allowedRoles = (process.env.AI_ALLOWED_ROLES || "admin,finance,logistics_manager").split(',').map(s=>s.trim()).filter(Boolean);
  const dailyDefault = parseInt(process.env.AI_DAILY_LIMIT_DEFAULT || "50");
  const dailyAdmin = parseInt(process.env.AI_DAILY_LIMIT_ADMIN || String(dailyDefault));
  const dailyFinance = parseInt(process.env.AI_DAILY_LIMIT_FINANCE || String(dailyDefault));
  const dailyLogMgr = parseInt(process.env.AI_DAILY_LIMIT_LOGISTICS_MANAGER || String(dailyDefault));
  const costIn = parseFloat(process.env.AI_COST_INPUT || "0");
  const costOut = parseFloat(process.env.AI_COST_OUTPUT || "0");
  if (!supabaseUrl || !serviceKey) { res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }); return; }
  if (!aiKey) { res.status(501).json({ error: "AI provider not configured" }); return; }

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

    const aiResp = await fetch(aiEndpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: "You are a concise assistant. Answer briefly and avoid extra tokens." },
          { role: "user", content: task + (Object.keys(context||{}).length ? `\n\nContext: ${JSON.stringify(context)}` : "") }
        ],
        max_tokens: 200,
        temperature: 0.2
      })
    });
    if (!aiResp.ok) { res.status(aiResp.status).send(await aiResp.text()); return; }
    const aiJson: any = await aiResp.json().catch(()=>({}));
    const content = aiJson?.choices?.[0]?.message?.content || "";
    const usage = aiJson?.usage || {};
    const tokensIn = usage?.prompt_tokens || 0;
    const tokensOut = usage?.completion_tokens || 0;
    const cost = ((tokensIn/1000) * costIn) + ((tokensOut/1000) * costOut);
    await fetch(`${supabaseUrl}/rest/v1/ai_usage`, {
      method: "POST",
      headers: { ...hSR, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ user_id: uid, role: (roles[0]||null), task, tokens_in: tokensIn, tokens_out: tokensOut, cost_usd: Number.isFinite(cost) ? Number(cost.toFixed(4)) : 0 })
    });

    res.status(200).json({ ok: true, user_id: uid, output: content, usage, cost_usd: Number.isFinite(cost) ? Number(cost.toFixed(4)) : 0 });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "ai_failed" });
  }
}
