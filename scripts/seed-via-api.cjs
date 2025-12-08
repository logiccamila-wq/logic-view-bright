const baseUrl = process.env.BASE_URL || 'https://81b47695.xyzlogicflow.pages.dev';

async function post(path, body) {
  const r = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const txt = await r.text();
  try { return { status: r.status, data: JSON.parse(txt) }; } catch { return { status: r.status, data: { raw: txt } }; }
}

(async () => {
  const users = [
    { email: 'logicdev@optilog.app', password: 'Dev.Multi#2025', role: 'admin' },
    { email: 'diretoria@optilog.app', password: 'Dir.Multi#2025', role: 'super_consultant' },
    { email: 'auditoria@optilog.app', password: 'Audit.Multi#2025', role: 'super_consultant' },
    { email: 'financeiro@optilog.app', password: 'Fin.Multi#2025', role: 'finance' },
    { email: 'operacoes@optilog.app', password: 'Ops.Multi#2025', role: 'operations' },
    { email: 'gerente.logistica@optilog.app', password: 'GL.Multi#2025', role: 'logistics_manager' },
    { email: 'gerente.manutencao@optilog.app', password: 'GM.Multi#2025', role: 'maintenance_manager' },
    { email: 'motorista.teste@optilog.app', password: 'Drive.Multi#2025', role: 'driver' },
    { email: 'mecanico.teste@optilog.app', password: 'Fix.Multi#2025', role: 'fleet_maintenance' },
    { email: 'auxiliar.manutencao@optilog.app', password: 'Aux.Multi#2025', role: 'maintenance_assistant' },
  ];
  const results = [];
  for (const u of users) {
    const create = await post('/api/create-user', u);
    const ensureRole = await post('/api/assign-role', { email: u.email, role: u.role });
    results.push({ email: u.email, role: u.role, create, ensureRole });
  }
  console.log(JSON.stringify({ baseUrl, results }, null, 2));
})();
