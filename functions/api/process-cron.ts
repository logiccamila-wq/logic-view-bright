export const onRequest: PagesFunction = async ({ request, env }) => {
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const now = new Date().toISOString();
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } as Record<string, string>;
  const overdueRes = await fetch(`${supabaseUrl}/rest/v1/process_actions?due_date=lt.${encodeURIComponent(now)}&status=not.eq.completed&limit=200`, { headers: h });
  const criticalRes = await fetch(`${supabaseUrl}/rest/v1/non_conformities?rpn=gte.200&status=eq.open&limit=200`, { headers: h });
  const overdue = overdueRes.ok ? await overdueRes.json() : [];
  const critical = criticalRes.ok ? await criticalRes.json() : [];
  return new Response(JSON.stringify({ success: true, overdue: (overdue || []).length, critical: (critical || []).length }), { status: 200 });
};

