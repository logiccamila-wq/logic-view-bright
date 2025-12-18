export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || ""
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 })

  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" } as Record<string, string>

  const users: Array<{ email: string; password: string; roles: string[]; full_name?: string }> = [
    { email: 'administrativo@ejgtransporte.com.br', password: 'Multi.13', roles: ['admin'], full_name: 'Administrativo' },
    { email: 'jailson.barros@ejgtransporte.com.br', password: 'Multi.13', roles: ['admin','logistics_manager','finance'], full_name: 'Jailson Barros' },
    { email: 'enio.gomes@ejgtransporte.com.br', password: 'Multi.13', roles: ['admin','logistics_manager','operations'], full_name: 'Enio Gomes' },
    { email: 'comercial@ejgtransporte.com.br', password: 'Multi.13', roles: ['commercial'], full_name: 'Comercial' },
    { email: 'mecanico@ejgtransporte.com.br', password: 'Multi.13', roles: ['fleet_maintenance'], full_name: 'Mecânico' },
    { email: 'frota@ejgtransporte.com.br', password: 'Multi.13', roles: ['fleet_maintenance'], full_name: 'Gestor de Frota' },
    { email: 'logiccamila@gmail.com', password: 'Multi.13', roles: ['admin','developer'], full_name: 'Camila Lareste' },
  ]

  const ensureUser = async (email: string, password: string, full_name?: string) => {
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
      // create user
      const rc = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name } })
      })
      if (!rc.ok) throw new Error(`create_user_failed: ${await rc.text()}`)
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
    return userId
  }

  const ensureRole = async (userId: string, role: string) => {
    const ins = await fetch(`${supabaseUrl}/rest/v1/user_roles?on_conflict=user_id,role`, {
      method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ user_id: userId, role })
    })
    if (!ins.ok) throw new Error(`assign_role_failed: ${await ins.text()}`)
  }

  const upsertModule = async (key: string, name: string, category: string, description?: string) => {
    const url = `${supabaseUrl}/rest/v1/modules?on_conflict=key`
    const r = await fetch(url, {
      method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ key, name, category, description: description || name, enabled: true })
    })
    if (!r.ok) throw new Error(`modules_upsert_failed: ${await r.text()}`)
  }

  const upsertPermission = async (profile_key: string, module_key: string, allowed = true) => {
    const url = `${supabaseUrl}/rest/v1/permissions?on_conflict=profile_key,module_key`
    const r = await fetch(url, {
      method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ profile_key, module_key, allowed })
    })
    if (!r.ok) throw new Error(`permissions_upsert_failed: ${await r.text()}`)
  }

  try {
    const created: Array<{ email: string; user_id: string; roles: string[] }> = []
    for (const u of users) {
      const id = await ensureUser(u.email, u.password, u.full_name)
      for (const role of u.roles) await ensureRole(id, role)
      created.push({ email: u.email, user_id: id, roles: u.roles })
    }

    const modulesList: Array<[string,string,string,string?]> = [
      ['dashboard','Dashboard OptiLog','core'],
      ['tms','TMS','logistics'],
      ['wms','WMS','logistics'],
      ['oms','OMS','operations'],
      ['mechanic-hub','Hub Mecânico','maintenance'],
      ['driver-app','App Motorista','mobile'],
      ['control-tower','Torre de Controle','operations'],
      ['crm','CRM','business'],
      ['erp','ERP','business'],
      ['employees','Funcionários','business'],
      ['users','Usuários','system'],
      ['inventory','Estoque/Oficina','maintenance'],
      ['settings','Configurações','system'],
      ['hr','Recursos Humanos','business'],
      ['dp','Departamento Pessoal','business'],
      ['supergestor','Supergestor','operations'],
      ['predictive-maintenance','Manutenção Preditiva','maintenance'],
      ['drivers-management','Gestão de Motoristas','operations'],
      ['approvals','Aprovações','operations'],
      ['logistics-kpi','KPIs de Logística','operations'],
      ['bank-reconciliation','Conciliação Bancária','finance'],
      ['cost-monitoring','Monitoramento de Custos','finance'],
      ['iot','IoT','iot'],
      ['permissions','Permissões','operations'],
      ['developer','Developer','dev'],
      ['reports','Relatórios','business'],
    ]
    for (const [key,name,category,desc] of modulesList) await upsertModule(key,name,category,desc)

    // Fetch all modules and grant permissions to admin and finance per request
    const modsRes = await fetch(`${supabaseUrl}/rest/v1/modules?select=key`, { headers: h })
    const mods = modsRes.ok ? await modsRes.json().catch(()=>[]) : []
    const moduleKeys: string[] = (mods || []).map((m:any)=>m.key).filter(Boolean)
    for (const mk of moduleKeys) {
      await upsertPermission('admin', mk, true)
      await upsertPermission('finance', mk, true)
    }

    return new Response(JSON.stringify({ ok: true, created }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
}
