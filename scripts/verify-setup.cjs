const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do Logic View Bright...\n');

// Verificar arquivos essenciais
const essentialFiles = [
  '.env',
  'supabase/.env',
  'vercel.json',
  'vite.config.ts',
  'src/integrations/supabase/client.ts'
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
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_PUBLIC_KEY'
];

requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

console.log('\n📦 Próximos passos:');
if (missingFiles.length > 0) {
  console.log('1. Criar arquivos faltantes');
}
console.log('2. Configurar variáveis de ambiente');
console.log('3. Executar migrações do Supabase');
console.log('4. Fazer seed dos dados');
console.log('5. Deploy no Vercel');
