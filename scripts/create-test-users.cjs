const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envs = {};
  const files = ['.env', '.env.local'];
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

async function createUserAndRole(supabaseUrl, serviceKey, email, password, role) {
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    return { email, ok: false, error: error.message };
  }
  const userId = data?.user?.id;
  if (!userId) {
    return { email, ok: false, error: 'missing_user_id' };
  }
  let roleResult = null;
  if (role) {
    const resp = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    const txt = await resp.text();
    try { roleResult = JSON.parse(txt); } catch { roleResult = { raw: txt }; }
    if (resp.status !== 201 && resp.status !== 200) {
      return { email, ok: false, error: 'assign_role_failed', detail: roleResult };
    }
  }
  return { email, ok: true, userId, role, roleResult };
}

(async () => {
  try {
    const envs = { ...process.env, ...loadEnv() };
    const supabaseUrl = envs.SUPABASE_URL || envs.VITE_SUPABASE_URL || '';
    const serviceKey = envs.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const users = [
      { email: 'logicdev@optilog.app', password: 'Dev.Multi#2025', role: 'admin' },
      { email: 'motorista.teste@optilog.app', password: 'Drive.Multi#2025', role: 'driver' },
      { email: 'mecanico.teste@optilog.app', password: 'Fix.Multi#2025', role: 'mechanic' },
    ];

    const results = [];
    for (const u of users) {
      results.push(await createUserAndRole(supabaseUrl, serviceKey, u.email, u.password, u.role));
    }
    console.log(JSON.stringify({ supabaseUrl, results }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Unexpected error:', e?.message || String(e));
    process.exit(1);
  }
})();
