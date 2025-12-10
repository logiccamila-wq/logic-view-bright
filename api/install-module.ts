export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" })

  let moduleId = ""
  let clientKey = ""
  try {
    const b = req.body || {}
    moduleId = (b.moduleId || "").trim()
    clientKey = (b.clientKey || "").trim()
  } catch {}
  if (!moduleId) return res.status(400).json({ error: "moduleId required" })

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
    ai: { name: "Inteligência Artificial", category: "advanced", comingSoon: true },
    blockchain: { name: "Blockchain", category: "advanced", comingSoon: true },
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
    reports: { name: "Relatórios", category: "business" }
  }

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
  const upsert = async (slug: string) => {
    const meta = known[slug] || { name: slug, category: "operations" }
    const enabled = !meta.comingSoon
    const url = `${supabaseUrl}/rest/v1/modules?on_conflict=slug`
    const r = await fetch(url, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ slug, name: meta.name, category: meta.category, description: meta.description || slug, enabled })
    })
    if (!r.ok) throw new Error(await r.text())
    return r.json().catch(() => ({}))
  }

  try {
    const targets = moduleId === "all" ? Object.keys(known).filter(k => !known[k]?.comingSoon) : [moduleId]
    const installed: string[] = []
    for (const slug of targets) {
      await upsert(slug)
      installed.push(slug)
    }
    return res.status(200).json({ ok: true, installedCount: installed.length, installed, client: clientKey || null })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "install_failed" })
  }
}

