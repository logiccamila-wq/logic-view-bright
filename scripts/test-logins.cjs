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

(async () => {
  const envs = { ...process.env, ...loadEnv() };
  const url = envs.VITE_SUPABASE_URL;
  const anon = envs.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, anon);
  async function tryLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { email, ok: false, error: error.message };
    return { email, ok: true, userId: data.user?.id };
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
  console.log(JSON.stringify({ url, results }, null, 2));
})();

