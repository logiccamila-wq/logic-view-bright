export default async function handler(req: any, res: any) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) { res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }); return; }

  const h: Record<string,string> = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };

  try {
    let body: any = req.body || {};
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const email = (body.email || "").trim();
    const password = (body.password || "").trim();
    const full_name = (body.full_name || "").trim();
    const roles: string[] = Array.isArray(body.roles) ? body.roles : [];
    if (!email || !password) { res.status(400).json({ error: "email and password required" }); return; }

    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
    u.searchParams.set("email", email);
    const r = await fetch(u.toString(), { headers: h });
    let userId = "";
    if (r.ok) {
      const js: any = await r.json().catch(()=>({}));
      const user = Array.isArray(js) ? js[0] : js?.users?.[0];
      userId = user?.id || "";
    }
    if (!userId) {
      const rc = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST", headers: h,
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } })
      });
      if (!rc.ok) { res.status(rc.status).send(await rc.text()); return; }
      const js: any = await rc.json().catch(()=>({}));
      userId = js?.id || js?.user?.id || "";
    }

    if (userId) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
        method: "POST", headers: { ...h, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ id: userId, email, full_name: full_name || email })
      });
    }

    for (const role of roles) {
      await fetch(`${supabaseUrl}/rest/v1/user_roles?on_conflict=user_id,role`, {
        method: "POST", headers: { ...h, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: userId, role })
      });
    }

    res.status(200).json({ ok: true, user_id: userId, email, roles });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "create_user_failed" });
  }
}
