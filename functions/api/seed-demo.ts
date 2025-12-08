export const onRequest: PagesFunction = async ({ env }) => {
  const supabaseUrl = (env as any).SUPABASE_URL || (env as any).VITE_SUPABASE_URL || '';
  const serviceKey = (env as any).SUPABASE_SERVICE_ROLE_KEY || '';
  const h = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' } as Record<string,string>;
  const demo = {
    vehicles: [
      { placa: 'ABC1A23', modelo: 'Volvo FH', tipo: 'truck', status: 'active' },
      { placa: 'DEF4B56', modelo: 'Scania R440', tipo: 'truck', status: 'active' },
    ],
    service_orders: [
      { issue_description: 'Troca de pastilhas de freio', odometer: 120000, priority: 'high', status: 'pending', vehicle_model: 'Volvo FH', vehicle_plate: 'ABC1A23' },
    ],
    trips: [
      { origin: 'São Paulo', destination: 'Rio de Janeiro', driver_id: 'demo', driver_name: 'Motorista Demo', status: 'running', vehicle_plate: 'ABC1A23' },
    ],
    refuelings: [
      { driver_id: 'demo', vehicle_plate: 'ABC1A23', km: 120500, liters: 200, total_value: 1800 },
    ],
    non_conformities: [
      { module: 'fleet', vehicle_plate: 'ABC1A23', description: 'Vibração anormal ao frear', severity: 7, occurrence: 6, detection: 6, status: 'open' },
    ],
  };
  const result: any = { inserted: {}, missingTables: [], demo };
  const tryInsert = async (table: string, rows: any[]) => {
    if (!supabaseUrl || !serviceKey) { result.missingEnv = true; return; }
    for (const row of rows) {
      const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, { method: 'POST', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
      if (!r.ok) {
        const txt = await r.text();
        if (txt.includes("Could not find the table") || r.status === 404) {
          if (!result.missingTables.includes(table)) result.missingTables.push(table);
        } else {
          result.inserted[table] = (result.inserted[table] || []);
          result.inserted[table].push({ warning: 'insert_failed', detail: txt, row });
        }
      } else {
        result.inserted[table] = (result.inserted[table] || []);
        result.inserted[table].push({ ok: true });
      }
    }
  };
  await tryInsert('vehicles', demo.vehicles);
  await tryInsert('service_orders', demo.service_orders);
  await tryInsert('trips', demo.trips);
  await tryInsert('refuelings', demo.refuelings);
  await tryInsert('non_conformities', demo.non_conformities);
  return new Response(JSON.stringify(result), { status: 200 });
};
