# Teste Automatizado de Performance (Exemplo)

// Exemplo de script para testar performance de API usando autocannon

const autocannon = require('autocannon');

async function run() {
  const result = await autocannon({
    url: 'https://optilog-app.vercel.app/api/vehicles',
    connections: 20,
    duration: 10
  });
  console.log(autocannon.printResult(result));
}

run();

// Para rodar:
// 1. Instale autocannon: npm install -g autocannon
// 2. Execute: node test_performance.js
