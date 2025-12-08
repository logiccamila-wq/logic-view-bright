export const onRequest: PagesFunction = async ({ env }) => {
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || '';
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } as Record<string,string>;
  const [fuelRes, tireRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/refuelings?select=liters,total_value,trip_id&limit=1000`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/service_orders?select=type,status,cost&limit=1000`, { headers: h }),
  ]);
  const fuels = fuelRes.ok ? await fuelRes.json() : [];
  const orders = tireRes.ok ? await tireRes.json() : [];
  const liters = (fuels||[]).reduce((acc:number,f:any)=>acc+Number(f.liters||0),0);
  const trips = Math.max(1,(new Set((fuels||[]).map((f:any)=>f.trip_id)).size)||1);
  const co2_per_km = Number(((liters*2.31)/Math.max(1,trips*100)).toFixed(2));
  const tireOrders = (orders||[]).filter((o:any)=>String(o.type||'').toLowerCase().includes('pneu'));
  const recycled = tireOrders.filter((o:any)=>String(o.status||'').includes('reciclado')).length;
  const tire_recycle_rate = tireOrders.length ? Number(((recycled/tireOrders.length)*100).toFixed(1))+'%' : '0%';
  const water_use_index = Number(((orders||[]).filter((o:any)=>String(o.type||'').toLowerCase().includes('lava')).length * 0.5).toFixed(2));
  const renewables_share = '30%';
  return new Response(JSON.stringify({ co2_per_km, tire_recycle_rate, water_use_index, renewables_share }), { status: 200 });
};
