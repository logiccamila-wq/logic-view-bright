export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || ""
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 })
  let email = ""
  let uid = ""
  let role = ""
  try {
    const b = await request.json()
    email = (b.email || "").trim()
    uid = (b.uid || "").trim()
    role = (b.role || "").trim()
  } catch {}
  if (!role) return new Response(JSON.stringify({ error: "role required" }), { status: 400 })
  let authUserId = uid
  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" }
  if (!authUserId && email) {
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`)
    u.searchParams.set("email", email)
    const r = await fetch(u.toString(), { headers })
    if (!r.ok) return new Response(JSON.stringify({ error: "failed_resolving_user", detail: await r.text() }), { status: r.status })
    const js = await r.json().catch(()=>({})) as any
    const user = Array.isArray(js) ? js[0] : js?.users?.[0]
    if (!user?.id) return new Response(JSON.stringify({ error: "user_not_found" }), { status: 404 })
    authUserId = user.id
  }
  if (!authUserId) return new Response(JSON.stringify({ error: "uid or email required" }), { status: 400 })
  const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: authUserId, role })
  })
  if (ins.status !== 201) return new Response(JSON.stringify({ error: "insert_failed", detail: await ins.text() }), { status: ins.status })
  return new Response(JSON.stringify({ success: true, user_id: authUserId, role }), { status: 200 })
}

