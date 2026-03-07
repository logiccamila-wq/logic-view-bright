const fs = require('fs');
const path = require('path');

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

async function createUserAndRole(runtimeBase, email, password, role) {
  // Sign up via Azure runtime
  const signupResp = await fetch(`${runtimeBase}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const signupData = await signupResp.json();
  if (signupData.error) {
    return { email, ok: false, error: signupData.error.message || String(signupData.error) };
  }
  const userId = signupData.data?.session?.user?.id;
  if (!userId) {
    return { email, ok: false, error: 'missing_user_id' };
  }
  return { email, ok: true, userId, role };
}

(async () => {
  try {
    const envs = { ...process.env, ...loadEnv() };
    const apiBase = (envs.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
    const runtimeBase = `${apiBase}/runtime`;

    const users = [
      { email: 'logicdev@optilog.app', password: 'Dev.Multi#2025', role: 'admin' },
      { email: 'motorista.teste@optilog.app', password: 'Drive.Multi#2025', role: 'driver' },
      { email: 'mecanico.teste@optilog.app', password: 'Fix.Multi#2025', role: 'fleet_maintenance' },
    ];

    const results = [];
    for (const u of users) {
      results.push(await createUserAndRole(runtimeBase, u.email, u.password, u.role));
    }
    console.log(JSON.stringify({ runtimeBase, results }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Unexpected error:', e?.message || String(e));
    process.exit(1);
  }
})();
