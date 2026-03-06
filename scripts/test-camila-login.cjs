const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    return Object.fromEntries(
      fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(line => line && !line.startsWith('#') && line.includes('='))
        .map(line => {
          const idx = line.indexOf('=');
          return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
        })
        .filter(([k]) => k)
    );
  }
  return {};
}

async function testLogin() {
  const envs = { ...process.env, ...loadEnv() };
  const supabaseUrl = envs.VITE_SUPABASE_URL || envs.SUPABASE_URL;
  const anonKey = envs.VITE_SUPABASE_PUBLISHABLE_KEY || envs.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL (or SUPABASE_URL) and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, anonKey);

  console.log('🔐 Testando login com logiccamila@gmail.com...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'logiccamila@gmail.com',
    password: 'Multi.13',
  });

  if (error) {
    console.error('❌ Erro no login:', error.message);
    process.exit(1);
  }

  console.log('✅ Login bem-sucedido!');
  console.log('\n📧 Email:', data.user.email);
  console.log('🆔 User ID:', data.user.id);
  console.log('✉️  Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
  console.log('\n👤 Metadata do usuário:');
  console.log(JSON.stringify(data.user.user_metadata, null, 2));
  console.log('\n✅ Nome exibido:', data.user.user_metadata?.name || data.user.user_metadata?.display_name || data.user.email);
  console.log('\n🌐 Pode fazer login em: https://logic-view-bright.vercel.app/login');
}

testLogin().catch(console.error);
