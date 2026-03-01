# Script de Monitoramento de Logs (Exemplo)

// Exemplo de script Node.js para monitorar logs de erro em produção

const https = require('https');

const url = 'https://optilog-app.vercel.app/api/health';

setInterval(() => {
  https.get(url, res => {
    if (res.statusCode !== 200) {
      console.error(`[${new Date().toISOString()}] ALERTA: API fora do ar! Status: ${res.statusCode}`);
    } else {
      console.log(`[${new Date().toISOString()}] OK: API saudável.`);
    }
  }).on('error', err => {
    console.error(`[${new Date().toISOString()}] ERRO: ${err.message}`);
  });
}, 60000); // verifica a cada 60 segundos

// Para rodar:
// node monitor_api.js
