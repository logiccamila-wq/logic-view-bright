export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || ""
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 })

  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" } as Record<string,string>

  try {
    const body = await request.json().catch(()=>({})) as any
    const email = (body.email || "").trim()
    const password = (body.password || "").trim()
    const full_name = (body.full_name || "").trim()
    const roles: string[] = Array.isArray(body.roles) ? body.roles : []
    if (!email || !password) return new Response(JSON.stringify({ error: "email and password required" }), { status: 400 })

    // resolve existing user
    const u = new URL(`${supabaseUrl}/auth/v1/admin/users`)
    u.searchParams.set('email', email)
    const r = await fetch(u.toString(), { headers: h })
    let userId = ''
    if (r.ok) {
      const js = await r.json().catch(()=>({})) as any
      const user = Array.isArray(js) ? js[0] : js?.users?.[0]
      userId = user?.id || ''
    }
    if (!userId) {
      const rc = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } })
      })
      if (!rc.ok) return new Response(JSON.stringify({ error: 'create_user_failed', detail: await rc.text() }), { status: rc.status })
      const js = await rc.json().catch(()=>({})) as any
      userId = js?.id || js?.user?.id || ''
    }

    // ensure profile
    if (userId) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
        method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: userId, email, full_name: full_name || email })
      })
    }

    // assign roles
    for (const role of roles) {
      await fetch(`${supabaseUrl}/rest/v1/user_roles?on_conflict=user_id,role`, {
        method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ user_id: userId, role })
      })
    }

    return new Response(JSON.stringify({ ok: true, user_id: userId, email, roles }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'create_user_failed' }), { status: 500 })
  }
}

