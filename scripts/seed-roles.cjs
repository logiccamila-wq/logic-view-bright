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

async function resolveUserId(supabaseUrl, serviceKey, email) {
  const u = new URL(`${supabaseUrl}/auth/v1/admin/users`);
  u.searchParams.set('email', email);
  const r = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  if (!r.ok) return null;
  const js = await r.json();
  const user = Array.isArray(js) ? js[0] : js?.users?.[0];
  return user?.id || null;
}

async function getExistingRoles(supabaseUrl, serviceKey, userId) {
  const u = new URL(`${supabaseUrl}/rest/v1/user_roles`);
  u.searchParams.set('user_id', `eq.${userId}`);
  const r = await fetch(u.toString(), { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
  if (!r.ok) return [];
  return await r.json();
}

async function insertRole(supabaseUrl, serviceKey, userId, role) {
  const r = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ user_id: userId, role }),
  });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; } catch { return { status: r.status, body: { raw: txt } }; }
}

(async () => {
  const envs = { ...process.env, ...loadEnv() };
  const supabaseUrl = envs.SUPABASE_URL || envs.VITE_SUPABASE_URL || '';
  const serviceKey = envs.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const targets = [
    { email: 'logicdev@optilog.app', role: 'admin' },
    { email: 'motorista.teste@optilog.app', role: 'driver' },
    { email: 'mecanico.teste@optilog.app', role: 'fleet_maintenance' },
  ];

  const out = [];
  for (const t of targets) {
    const userId = await resolveUserId(supabaseUrl, serviceKey, t.email);
    if (!userId) { out.push({ email: t.email, ok: false, error: 'user_not_found' }); continue; }
    const existing = await getExistingRoles(supabaseUrl, serviceKey, userId);
    const alreadyHas = existing.some(r => r.role === t.role);
    if (alreadyHas) { out.push({ email: t.email, ok: true, userId, role: t.role, note: 'role_already_present' }); continue; }
    const ins = await insertRole(supabaseUrl, serviceKey, userId, t.role);
    if (ins.status === 201 || ins.status === 200) out.push({ email: t.email, ok: true, userId, role: t.role });
    else out.push({ email: t.email, ok: false, userId, role: t.role, error: 'insert_failed', detail: ins.body });
  }
  console.log(JSON.stringify({ supabaseUrl, results: out }, null, 2));
})();

