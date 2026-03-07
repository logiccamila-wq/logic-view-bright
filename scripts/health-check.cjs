const https = require('https');

const checks = {
  azure: process.env.VITE_API_BASE_URL || 'http://localhost:7071',
  app: 'https://www.xyzlogicflow.com.br',
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
