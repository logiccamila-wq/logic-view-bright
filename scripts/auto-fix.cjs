const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Auto-Fix: Corrigindo Problemas Comuns\n');

const fixes = [];

// 1. Garantir que node_modules existe
console.log('📦 Verificando node_modules...');
const nodeModulesPath = path.join('/workspaces/logic-view-bright', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('  ⚙️  Instalando dependências...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: '/workspaces/logic-view-bright' });
    fixes.push('✅ Dependências instaladas');
  } catch (error) {
    fixes.push('❌ Erro ao instalar dependências');
  }
} else {
  fixes.push('✅ node_modules já existe');
}

// 2. Criar .env se não existir
console.log('\n🔐 Verificando .env...');
const envPath = path.join('/workspaces/logic-view-bright', '.env');
const envExamplePath = path.join('/workspaces/logic-view-bright', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    fixes.push('✅ .env criado a partir de .env.example');
    console.log('  ⚠️  Configure as variáveis em .env antes de continuar!');
  } else {
    // Criar .env básico
    const basicEnv = `# Azure Runtime
VITE_API_BASE_URL=

# Azure JWT
AZURE_JWT_SECRET=change-me-in-production
AZURE_JWT_EXPIRES_IN=7d

# Azure PostgreSQL
AZURE_POSTGRES_HOST=
AZURE_POSTGRES_PORT=5432
AZURE_POSTGRES_DB=
AZURE_POSTGRES_USER=
AZURE_POSTGRES_PASSWORD=

# EmailJS
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

# Maps
VITE_OPENROUTE_API_KEY=
VITE_TOMTOM_API_KEY=

# WhatsApp
VITE_WHATSAPP_TOKEN=
`;
    fs.writeFileSync(envPath, basicEnv);
    fixes.push('✅ .env básico criado');
    console.log('  ⚠️  Configure as variáveis em .env antes de continuar!');
  }
} else {
  fixes.push('✅ .env já existe');
}

// 3. Verificar build
console.log('\n🔨 Testando build...');
try {
  execSync('npm run build', { 
    stdio: 'pipe', 
    cwd: '/workspaces/logic-view-bright' 
  });
  fixes.push('✅ Build passou sem erros');
} catch (error) {
  fixes.push('⚠️  Build com erros - verifique manualmente');
  console.log('  Execute: npm run build -- --debug para detalhes');
}

// 4. Verificar TypeScript
console.log('\n📝 Verificando TypeScript...');
try {
  execSync('npx tsc --noEmit', { 
    stdio: 'pipe', 
    cwd: '/workspaces/logic-view-bright' 
  });
  fixes.push('✅ TypeScript sem erros');
} catch (error) {
  fixes.push('⚠️  TypeScript com erros - verifique tsconfig.json');
}

// Resumo
console.log('\n\n' + '='.repeat(60));
console.log('📋 RESUMO DAS CORREÇÕES');
console.log('='.repeat(60) + '\n');
fixes.forEach(fix => console.log(fix));

console.log('\n✨ Auto-fix concluído!\n');
