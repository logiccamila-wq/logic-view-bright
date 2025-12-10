export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || ""
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const moduleId = (body?.moduleId as string) || ""
    const clientKey = (body?.clientKey as string) || "ejg"
    if (!moduleId) {
      return new Response(JSON.stringify({ error: "moduleId required" }), { status: 400 })
    }

    const headers = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    } as Record<string, string>

    const known: Record<string, { name: string; category: string; description?: string; comingSoon?: boolean }> = {
      dashboard: { name: "Dashboard OptiLog", category: "core" },
      tms: { name: "TMS", category: "logistics" },
      wms: { name: "WMS", category: "logistics" },
      oms: { name: "OMS", category: "operations" },
      "mechanic-hub": { name: "Hub Mecânico", category: "maintenance" },
      "driver-app": { name: "App Motorista", category: "mobile" },
      "control-tower": { name: "Torre de Controle", category: "operations" },
      crm: { name: "CRM", category: "business" },
      erp: { name: "ERP", category: "business" },
      supergestor: { name: "Supergestor", category: "operations" },
      "predictive-maintenance": { name: "Manutenção Preditiva", category: "maintenance" },
      "drivers-management": { name: "Gestão de Motoristas", category: "operations" },
      approvals: { name: "Aprovações", category: "operations" },
      "logistics-kpi": { name: "KPIs de Logística", category: "operations" },
      "bank-reconciliation": { name: "Conciliação Bancária", category: "finance" },
      "cost-monitoring": { name: "Monitoramento de Custos", category: "finance" },
      iot: { name: "IoT", category: "iot" },
      permissions: { name: "Permissões", category: "operations" },
      developer: { name: "Developer", category: "dev" },
      reports: { name: "Relatórios", category: "business" },
    }

    const upsertModule = async (key: string) => {
      const meta = known[key] || { name: key, category: "operations" }
      const enabled = !meta.comingSoon
      const url = `${supabaseUrl}/rest/v1/modules?on_conflict=key`
      const r = await fetch(url, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ key, name: meta.name, category: meta.category, description: meta.description || key, enabled })
      })
      if (!r.ok) {
        const txt = await r.text()
        throw new Error(`modules upsert failed: ${txt}`)
      }
      await r.json().catch(() => ({}))
    }

    const targets = moduleId === "all" ? Object.keys(known) : [moduleId]
    const installed: string[] = []
    for (const key of targets) {
      await upsertModule(key)
      installed.push(key)
    }

    return new Response(JSON.stringify({ ok: true, installedCount: installed.length, installed, client: clientKey }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
}
