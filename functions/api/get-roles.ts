export const onRequest: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  const uid = (url.searchParams.get("uid") || "").trim();
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  let userId = uid;
  if (!userId && email) {
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
    u.searchParams.set("email", email);
    const r = await fetch(u.toString(), { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (!r.ok) return new Response(JSON.stringify({ error: "failed_resolving_user", detail: await r.text() }), { status: r.status });
    const js = await r.json();
    const user = Array.isArray(js) ? js[0] : js?.users?.[0];
    userId = user?.id || "";
  }
  if (!userId) return new Response(JSON.stringify({ error: "uid_or_email_required" }), { status: 400 });
  const ru = new URL(`${supabaseUrl}/rest/v1/user_roles`);
  ru.searchParams.set("user_id", `eq.${userId}`);
  const rr = await fetch(ru.toString(), { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
  const roles = rr.ok ? await rr.json() : [];
  return new Response(JSON.stringify({ user_id: userId, roles }), { status: 200 });
};

