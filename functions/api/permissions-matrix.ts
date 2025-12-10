export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } as Record<string, string>;

  const [modsRes, rolesRes, permRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/modules`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/user_roles?select=role`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/permissions`, { headers: h }),
  ]);

  const modules = modsRes.ok ? await modsRes.json().catch(()=>[]) : [];
  const rolesRows = rolesRes.ok ? await rolesRes.json().catch(()=>[]) : [];
  const roleKeys = Array.from(new Set((rolesRows || []).map((r:any)=>r.role))).filter(Boolean);
  const profiles = roleKeys.map((key:string)=>({ key, name: key }));

  let permissionsRows: any[] = [];
  if (permRes.ok) {
    try { permissionsRows = await permRes.json(); } catch { permissionsRows = []; }
  } else {
    try { const txt = await permRes.text(); permissionsRows = []; } catch { permissionsRows = []; }
  }

  const matrix: Record<string, Record<string, boolean>> = {};
  for (const row of permissionsRows) {
    const mk = row.module_key;
    const pk = row.profile_key;
    if (!mk || !pk) continue;
    matrix[mk] = matrix[mk] || {};
    matrix[mk][pk] = !!row.allowed;
  }

  return new Response(JSON.stringify({ modules, profiles, matrix }), { status: 200 });
};
