export default async function handler(req: any, res: any) {
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) { res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }); return; }
  const h: Record<string,string> = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  try {
    const [modsRes, rolesRes, permRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/modules`, { headers: h }),
      fetch(`${supabaseUrl}/rest/v1/user_roles?select=role`, { headers: h }),
      fetch(`${supabaseUrl}/rest/v1/permissions`, { headers: h })
    ]);
    const modules = modsRes.ok ? await modsRes.json().catch(()=>[]) : [];
    const rolesRows = rolesRes.ok ? await rolesRes.json().catch(()=>[]) : [];
    const roleKeys = Array.from(new Set((rolesRows || []).map((r:any)=>r.role))).filter(Boolean);
    const profiles = roleKeys.map((key:string)=>({ key, name: key }));
    let permissionsRows: any[] = [];
    if (permRes.ok) { try { permissionsRows = await permRes.json(); } catch { permissionsRows = []; } }
    const matrix: Record<string, Record<string, boolean>> = {};
    for (const row of permissionsRows) {
      const mk = (row as any).module_key;
      const pk = (row as any).profile_key;
      if (!mk || !pk) continue;
      matrix[mk] = matrix[mk] || {};
      matrix[mk][pk] = !!(row as any).allowed;
    }
    res.status(200).json({ modules, profiles, matrix });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "matrix_failed" });
  }
}
