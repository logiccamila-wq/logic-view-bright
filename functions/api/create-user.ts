export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let email = "", password = "", role = "";
  try {
    const b = await request.json();
    email = (b.email || "").trim();
    password = (b.password || "").trim();
    role = (b.role || "").trim();
  } catch {}
  if (!email || !password) return new Response(JSON.stringify({ error: "email and password required" }), { status: 400 });
  const r = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    body: JSON.stringify({ email, password, email_confirm: true })
  });
  const userResText = await r.text();
  let userRes: any = null;
  try { userRes = JSON.parse(userResText); } catch { userRes = { raw: userResText }; }
  if (!r.ok) return new Response(JSON.stringify({ error: "create_user_failed", detail: userRes }), { status: r.status });
  const userId = userRes?.user?.id || userRes?.id || "";
  if (!userId) return new Response(JSON.stringify({ error: "user_id_missing", detail: userRes }), { status: 500 });
  let roleResult: any = null;
  if (role) {
    const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: "return=representation" },
      body: JSON.stringify({ user_id: userId, role })
    });
    const txt = await ins.text();
    try { roleResult = JSON.parse(txt); } catch { roleResult = { raw: txt }; }
    if (ins.status !== 201 && ins.status !== 200) return new Response(JSON.stringify({ error: "assign_role_failed", detail: roleResult }), { status: ins.status });
  }
  return new Response(JSON.stringify({ success: true, user_id: userId, email, role, user: userRes, roleResult }), { status: 200 });
};

