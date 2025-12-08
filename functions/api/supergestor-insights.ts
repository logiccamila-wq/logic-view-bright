export const onRequest: PagesFunction = async ({ env }) => {
  const e = env as unknown as Record<string, string>;
  const supabaseUrl = e.SUPABASE_URL || e.VITE_SUPABASE_URL || '';
  const serviceKey = e.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { status: 500 });
  const h: Record<string, string> = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
  const [vehRes, ordersRes, tripsRes, ncRes, finRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/vehicles?select=id,status&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/service_orders?select=id,status&status=eq.pendente&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/trips?select=id,status&status=in.(running,started)&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/non_conformities?select=id,rpn,status&status=eq.open&rpn=gte.200&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/finance_ledgers?select=id,amount&type=in.(expense,revenue)&limit=1000`, { headers: h }),
  ]);
  const vehicles: Array<{ id: string; status?: string }> = vehRes.ok ? await vehRes.json() : [];
  const orders: Array<{ id: string; status?: string }> = ordersRes.ok ? await ordersRes.json() : [];
  const trips: Array<{ id: string; status?: string }> = tripsRes.ok ? await tripsRes.json() : [];
  const ncs: Array<{ id: string; rpn?: number; status?: string }> = ncRes.ok ? await ncRes.json() : [];
  const fins: Array<{ id: string; amount?: number }> = finRes.ok ? await finRes.json() : [];
  const avgCostKm = (fins || []).reduce((acc: number, f) => acc + Number(f.amount || 0), 0) / Math.max(1, (trips || []).length * 100);
  const start = new Date();
  start.setMonth(start.getMonth() - 12);
  const revRes = await fetch(`${supabaseUrl}/rest/v1/revenue_records?select=valor_frete,valor_icms,data_emissao,status&status=eq.ativo&data_emissao=gte.${start.toISOString()}&limit=100000`, { headers: h });
  const revs: Array<{ valor_frete?: number; valor_icms?: number }> = revRes.ok ? await revRes.json() : [];
  const receitaTotal = (revs || []).reduce((t: number, r) => t + Number(r?.valor_frete || 0), 0);
  const icmsTotal = (revs || []).reduce((t: number, r) => t + Number(r?.valor_icms || 0), 0);
  return new Response(JSON.stringify({
    vehiclesActive: (vehicles || []).filter((v) => v.status === 'active').length,
    ordersPending: (orders || []).length,
    tripsRunning: (trips || []).length,
    criticalNC: (ncs || []).length,
    avgCostKm: Number.isFinite(avgCostKm) ? Number(avgCostKm.toFixed(2)) : null,
    predictedMaint: Math.round(((vehicles || []).length || 0) * 0.1),
    receitaTotal,
    icmsTotal,
  }), { status: 200 });
};
