export const onRequest: PagesFunction = async ({ env }) => {
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || "";
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } as Record<string,string>;
  const [vehRes, ncRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/vehicles?select=id,plate,year,mileage,last_service_km&limit=200`, { headers: h }),
    fetch(`${supabaseUrl}/rest/v1/non_conformities?select=id,vehicle_id,rpn,created_at,status&status=eq.open&limit=500`, { headers: h }),
  ]);
  const vehicles = vehRes.ok ? await vehRes.json() : [];
  const ncs = ncRes.ok ? await ncRes.json() : [];
  const predictions = (vehicles || []).slice(0, 50).map((v: any) => {
    const ncScore = (ncs || []).filter((n: any) => n.vehicle_id === v.id).reduce((acc: number, n: any) => acc + (n.rpn || 0), 0);
    const mileage = Number(v.mileage || 0);
    const lastServiceKm = Number(v.last_service_km || 0);
    const delta = Math.max(0, mileage - lastServiceKm);
    const risk = Math.min(1, (ncScore/1000) + (delta/20000));
    const dueDays = Math.max(1, Math.round(30 * risk));
    const system = risk > 0.7 ? 'Freios' : risk > 0.5 ? 'Suspensão' : 'Lubrificação';
    return { vehicle_id: v.id, plate: v.plate, system, risk, due_in_days: dueDays };
  });
  return new Response(JSON.stringify({ predictions }), { status: 200 });
};
