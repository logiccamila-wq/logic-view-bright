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

(async () => {
  const envs = { ...process.env, ...loadEnv() };
  const apiBase = (envs.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
  const runtimeBase = `${apiBase}/runtime`;

  async function tryLogin(email, password) {
    const resp = await fetch(`${runtimeBase}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (data.error) return { email, ok: false, error: data.error.message || String(data.error) };
    return { email, ok: true, userId: data.data?.session?.user?.id };
  }

  const users = [
    { email: 'logicdev@optilog.app', password: 'Dev.Multi#2025' },
    { email: 'motorista.teste@optilog.app', password: 'Drive.Multi#2025' },
    { email: 'mecanico.teste@optilog.app', password: 'Fix.Multi#2025' },
  ];
  const results = [];
  for (const u of users) {
    results.push(await tryLogin(u.email, u.password));
  }
  console.log(JSON.stringify({ runtimeBase, results }, null, 2));
})();

