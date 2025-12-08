export const onRequest: PagesFunction = async () => {
  const now = Date.now();
  const vehicles = ['EJG-1234','AAZ-9988','BRZ-5521'];
  const events = Array.from({ length: 25 }).map((_, i) => ({
    ts: new Date(now - i * 60000).toISOString(),
    type: ['gps','rpm','temp','tpms'][i % 4],
    vehicle: vehicles[i % vehicles.length],
    value: Number((Math.random()*100).toFixed(1)),
  }));
  return new Response(JSON.stringify({ events }), { status: 200 });
};
