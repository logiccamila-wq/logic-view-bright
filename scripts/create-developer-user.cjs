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

async function createDeveloperUser() {
  try {
    const envs = { ...process.env, ...loadEnv() };
    const apiBase = (envs.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
    const runtimeBase = `${apiBase}/runtime`;

    console.log('🔧 Criando usuário desenvolvedor...\n');
    console.log('📧 Email: logiccamila@gmail.com');
    console.log('🔑 Senha: Multi.13\n');

    // Try to sign up the developer user via the Azure runtime
    const signupResp = await fetch(`${runtimeBase}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'logiccamila@gmail.com',
        password: 'Multi.13',
        full_name: 'Camila - Developer',
        role: 'admin',
      }),
    });

    const signupData = await signupResp.json();

    if (signupData.error) {
      const msg = signupData.error.message || String(signupData.error);
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        console.log('⚠️  Usuário já existe no sistema');
        console.log('\n✅ Usuário desenvolvedor já configurado.');
      } else {
        console.error('❌ Erro ao criar usuário:', msg);
        process.exit(1);
      }
    } else {
      const userId = signupData.data?.session?.user?.id;
      console.log(`✅ Usuário criado com sucesso!`);
      if (userId) console.log(`👤 User ID: ${userId}`);
    }

    console.log('\n✅ Usuário desenvolvedor configurado com sucesso!');
    console.log('\n🔐 Credenciais de Login:');
    console.log('   Email: logiccamila@gmail.com');
    console.log('   Senha: Multi.13');
    console.log('\n🌐 URL de Login: https://www.xyzlogicflow.com.br/login\n');

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro inesperado:', e?.message || String(e));
    process.exit(1);
  }
}

createDeveloperUser();
