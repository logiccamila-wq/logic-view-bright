export default async function handler(req: any, res: any) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) { res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }); return; }
  let email = ""; let uid = ""; let role = "";
  try {
    let b: any = req.body || {};
    if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
    email = (b.email || "").trim();
    uid = (b.uid || "").trim();
    role = (b.role || "").trim();
  } catch {}
  if (!role) { res.status(400).json({ error: "role required" }); return; }
  let authUserId = uid;
  const headers: Record<string,string> = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  try {
    if (!authUserId && email) {
      const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
      u.searchParams.set("email", email);
      const r = await fetch(u.toString(), { headers });
      if (!r.ok) { res.status(r.status).send(await r.text()); return; }
      const js: any = await r.json().catch(()=>({}));
      const user = Array.isArray(js) ? js[0] : js?.users?.[0];
      if (!user?.id) { res.status(404).json({ error: "user_not_found" }); return; }
      authUserId = user.id;
    }
    if (!authUserId) { res.status(400).json({ error: "uid or email required" }); return; }
    const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: authUserId, role })
    });
    if (ins.status !== 201) { res.status(ins.status).send(await ins.text()); return; }
    res.status(200).json({ success: true, user_id: authUserId, role });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "assign_role_failed" });
  }
}
