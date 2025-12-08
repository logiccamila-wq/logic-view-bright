export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || '';
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { status: 500 });
  let body: any = {};
  try { body = await request.json(); } catch {}
  const plate = (body.plate || '').trim();
  const driver = (body.driver || '').trim();
  const kind = (body.kind || 'entry').trim();
  if (!plate) return new Response(JSON.stringify({ error: 'plate required' }), { status: 400 });
  const payload = { plate, driver, kind, ts: new Date().toISOString() };
  const r = await fetch(`${supabaseUrl}/rest/v1/gate_events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const detail = await r.text();
    return new Response(JSON.stringify({ warning: 'insert_failed', detail, payload }), { status: 200 });
  }
  return new Response(JSON.stringify({ success: true, payload }), { status: 200 });
};
