export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } as Record<string, string>;
  const [modsRes, profRes, permRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/modules`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/profiles`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/permissions`, { headers: h }),
  ]);
  const modules = modsRes.ok ? await modsRes.json() : [];
  const profiles = profRes.ok ? await profRes.json() : [];
  let permissions: any = [];
  if (permRes.ok) {
    try { permissions = await permRes.json(); } catch { permissions = []; }
  } else {
    try { const txt = await permRes.text(); permissions = { warning: "permissions_table_missing", detail: txt }; } catch { permissions = []; }
  }
  return new Response(JSON.stringify({ modules, profiles, permissions }), { status: 200 });
};
