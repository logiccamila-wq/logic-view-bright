const https = require('https');

const checks = {
  supabase: process.env.VITE_SUPABASE_URL,
  vercel: 'https://logic-view-bright.vercel.app', // Ajuste conforme seu domínio
};

async function checkEndpoint(name, url) {
  return new Promise((resolve) => {
    if (!url) {
      console.log(`❌ ${name}: URL não configurada`);
      resolve(false);
      return;
    }

    https.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301) {
        console.log(`✅ ${name}: OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`⚠️  ${name}: Status ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${name}: Erro - ${err.message}`);
      resolve(false);
    });
  });
}

async function runHealthCheck() {
  console.log('🏥 Verificação de Saúde do Sistema\n');
  
  for (const [name, url] of Object.entries(checks)) {
    await checkEndpoint(name, url);
  }
  
  console.log('\n✅ Verificação concluída');
}

runHealthCheck();
