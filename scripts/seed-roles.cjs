const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envs = {};
  const files = ['.env.local', '.env'];
  for (const f of files) {
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const line of txt.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const idx = t.indexOf('=');
        if (idx === -1) continue;
        const key = t.slice(0, idx).trim();
        let val = t.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        envs[key] = val;
      }
    }
  }
  return envs;
}

async function signIn(runtimeBase, email, password) {
  const r = await fetch(`${runtimeBase}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const js = await r.json();
  return js?.data?.session?.access_token || null;
}

async function resolveUserId(runtimeBase, token, email) {
  const r = await fetch(`${runtimeBase}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ table: 'users', select: 'id', filters: [{ op: 'eq', column: 'email', value: email }], single: true }),
  });
  const js = await r.json();
  return js?.data?.id || null;
}

async function getExistingRoles(runtimeBase, token, userId) {
  const r = await fetch(`${runtimeBase}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ table: 'user_roles', select: 'role', filters: [{ op: 'eq', column: 'user_id', value: userId }] }),
  });
  const js = await r.json();
  return Array.isArray(js?.data) ? js.data : [];
}

async function insertRole(runtimeBase, token, userId, role) {
  const r = await fetch(`${runtimeBase}/mutate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'insert', table: 'user_roles', values: { user_id: userId, role }, returning: 'user_id,role' }),
  });
  const js = await r.json();
  return { status: r.status, body: js };
}

(async () => {
  const envs = { ...process.env, ...loadEnv() };
  const apiBase = (envs.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
  const runtimeBase = `${apiBase}/runtime`;
  const adminEmail = envs.ADMIN_EMAIL || 'admin@xyzlogicflow.com.br';
  const adminPassword = envs.ADMIN_PASSWORD || 'admin123';

  // Sign in as admin to get an auth token
  const token = await signIn(runtimeBase, adminEmail, adminPassword);
  if (!token) {
    console.error('Failed to sign in as admin. Check ADMIN_EMAIL/ADMIN_PASSWORD env vars.');
    process.exit(1);
  }

  const targets = [
    { email: 'logicdev@optilog.app', role: 'admin' },
    { email: 'motorista.teste@optilog.app', role: 'driver' },
    { email: 'mecanico.teste@optilog.app', role: 'fleet_maintenance' },
  ];

  const out = [];
  for (const t of targets) {
    const userId = await resolveUserId(runtimeBase, token, t.email);
    if (!userId) { out.push({ email: t.email, ok: false, error: 'user_not_found' }); continue; }
    const existing = await getExistingRoles(runtimeBase, token, userId);
    const alreadyHas = existing.some(r => r.role === t.role);
    if (alreadyHas) { out.push({ email: t.email, ok: true, userId, role: t.role, note: 'role_already_present' }); continue; }
    const ins = await insertRole(runtimeBase, token, userId, t.role);
    if (ins.status === 201 || ins.status === 200) out.push({ email: t.email, ok: true, userId, role: t.role });
    else out.push({ email: t.email, ok: false, userId, role: t.role, error: 'insert_failed', detail: ins.body });
  }
  console.log(JSON.stringify({ runtimeBase, results: out }, null, 2));
})();

