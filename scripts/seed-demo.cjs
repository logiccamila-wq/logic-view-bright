const baseUrl = process.env.BASE_URL || 'https://xyzlogicflow.pages.dev';
async function post(path, body){
  const r = await fetch(baseUrl + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const t = await r.text();
  try { return { ok: r.ok, data: JSON.parse(t) }; } catch { return { ok: r.ok, data: { raw: t } }; }
}

async function run(){
  console.log('Seeding demo on', baseUrl);
  const vehicle = await post('/api/db', { op:'create', table:'vehicles', data:{ plate:'EJG-1234', status:'active', mileage: 120000, last_service_km: 110000 } });
  console.log('vehicle', vehicle.ok);
  const trip = await post('/api/db', { op:'create', table:'trips', data:{ driver_id:'demo', vehicle_plate:'EJG-1234', origin:'Curitiba', destination:'São Paulo', status:'em_andamento' } });
  console.log('trip', trip.ok);
  const macro = await post('/api/db', { op:'create', table:'trip_macros', data:{ trip_id: trip.data?.[0]?.id || null, driver_id:'demo', macro_type:'INICIO', timestamp: new Date().toISOString() } });
  console.log('macro', macro.ok);
  const refuel = await post('/api/db', { op:'create', table:'refuelings', data:{ trip_id: trip.data?.[0]?.id || null, driver_id:'demo', vehicle_plate:'EJG-1234', km: 120500, liters: 50, total_value: 350 } });
  console.log('refuel', refuel.ok);
  const so = await post('/api/db', { op:'create', table:'service_orders', data:{ vehicle_id: vehicle.data?.[0]?.id || null, type:'Preventiva', status:'aberta', scheduled_for: new Date().toISOString(), cost: 0 } });
  console.log('service_order', so.ok);
  const gate = await post('/api/gate-event', { plate:'EJG-1234', driver:'demo', kind:'entry' });
  console.log('gate', gate.ok);
}

run().catch(e=>{ console.error(e); process.exit(1); });
