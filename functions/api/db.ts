export const onRequest: PagesFunction = async ({ request, env }) => {
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || '';
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { status: 500 });
  const allowed = new Set(['trips','trip_macros','refuelings','service_orders','gate_events','non_conformities','vehicles','finance_ledgers','cte']);
  let payload: any = {};
  try { payload = await request.json(); } catch {}
  const op = (payload.op || '').toLowerCase();
  const table = (payload.table || '').toLowerCase();
  if (!allowed.has(table)) return new Response(JSON.stringify({ error: 'table_not_allowed' }), { status: 400 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' } as Record<string,string>;
  if (op === 'create') {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(payload.data || {}) });
    const t = await r.text();
    try { return new Response(t, { status: r.status }); } catch { return new Response(JSON.stringify({ raw: t }), { status: r.status }); }
  }
  if (op === 'list') {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=${encodeURIComponent(String(payload.limit || 50))}`, { headers: h });
    const t = await r.text();
    try { return new Response(t, { status: r.status }); } catch { return new Response(JSON.stringify({ raw: t }), { status: r.status }); }
  }
  if (op === 'update') {
    const id = payload.id;
    if (!id) return new Response(JSON.stringify({ error: 'id_required' }), { status: 400 });
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(String(id))}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(payload.data || {}) });
    const t = await r.text();
    try { return new Response(t, { status: r.status }); } catch { return new Response(JSON.stringify({ raw: t }), { status: r.status }); }
  }
  if (op === 'delete') {
    const id = payload.id;
    if (!id) return new Response(JSON.stringify({ error: 'id_required' }), { status: 400 });
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(String(id))}`, { method: 'DELETE', headers: { ...h, Prefer: 'return=representation' } });
    const t = await r.text();
    try { return new Response(t, { status: r.status }); } catch { return new Response(JSON.stringify({ raw: t }), { status: r.status }); }
  }
  return new Response(JSON.stringify({ error: 'op_not_supported' }), { status: 400 });
};
