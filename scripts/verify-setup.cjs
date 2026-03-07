const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do Logic View Bright...\n');

// Verificar arquivos essenciais
const essentialFiles = [
  '.env',
  'staticwebapp.config.json',
  'vite.config.ts',
  'src/integrations/azure/client.ts'
];

const missingFiles = [];
essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.log(`❌ Faltando: ${file}`);
  } else {
    console.log(`✅ Encontrado: ${file}`);
  }
});

// Verificar variáveis de ambiente
console.log('\n📋 Variáveis de Ambiente Necessárias:');
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'AZURE_JWT_SECRET',
  'AZURE_POSTGRES_HOST',
  'AZURE_POSTGRES_DB',
  'AZURE_POSTGRES_USER',
  'AZURE_POSTGRES_PASSWORD',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY'
];

requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

console.log('\n📦 Próximos passos:');
if (missingFiles.length > 0) {
  console.log('1. Criar arquivos faltantes');
}
console.log('2. Configurar variáveis de ambiente');
console.log('3. Aplicar migrações SQL em sql/migrations/ no Azure PostgreSQL');
console.log('4. Fazer seed dos dados: node scripts/seed-demo.cjs');
console.log('5. Deploy: git push origin main (Azure Static Web Apps)');
