const fs = require('fs');
const path = require('path');

console.log('🔍 Validação Completa do Sistema Logic View Bright\n');

// 1. Verificar estrutura de arquivos críticos
const criticalFiles = {
  'Config': [
    'vite.config.ts',
    'staticwebapp.config.json',
    'tsconfig.json',
    'tailwind.config.js'
  ],
  'Frontend Core': [
    'src/main.tsx',
    'src/App.tsx',
    'src/integrations/azure/client.ts',
    'src/modules/registry.ts'
  ],
  'Backend': [
    'api/runtime/index.js',
    'api/shared/db.js'
  ],
  'Environment': [
    '.env.example'
  ]
};

console.log('📁 Verificando Estrutura de Arquivos:\n');
let missingFiles = [];

Object.entries(criticalFiles).forEach(([category, files]) => {
  console.log(`\n  ${category}:`);
  files.forEach(file => {
    const filePath = path.join('/workspaces/logic-view-bright', file);
    if (fs.existsSync(filePath)) {
      console.log(`    ✅ ${file}`);
    } else {
      console.log(`    ❌ ${file}`);
      missingFiles.push(file);
    }
  });
});

// 2. Verificar package.json
console.log('\n\n📦 Verificando Dependências:\n');
const packageJsonPath = path.join('/workspaces/logic-view-bright', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const criticalDeps = [
    'react',
    'react-dom',
    'vite',
    '@tanstack/react-query',
    'tailwindcss',
    'pg'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - FALTANDO`);
    }
  });
}

// 3. Verificar variáveis de ambiente
console.log('\n\n🔐 Variáveis de Ambiente Necessárias:\n');
const requiredEnvVars = [
  { key: 'VITE_API_BASE_URL', example: 'http://localhost:7071' },
  { key: 'AZURE_JWT_SECRET', example: 'change-me-in-production' },
  { key: 'AZURE_POSTGRES_HOST', example: 'myserver.postgres.database.azure.com' },
  { key: 'AZURE_POSTGRES_DB', example: 'optilog' },
  { key: 'VITE_EMAILJS_SERVICE_ID', example: 'service_xxx' },
  { key: 'VITE_EMAILJS_TEMPLATE_ID', example: 'template_xxx' },
  { key: 'VITE_EMAILJS_PUBLIC_KEY', example: 'xxx' },
  { key: 'VITE_OPENROUTE_API_KEY', example: '5b3ce3597851...' },
  { key: 'VITE_TOMTOM_API_KEY', example: 'xxx' }
];

const envPath = path.join('/workspaces/logic-view-bright', '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

requiredEnvVars.forEach(({ key, example }) => {
  if (envVars[key] && envVars[key] !== '') {
    console.log(`  ✅ ${key}`);
  } else {
    console.log(`  ❌ ${key}`);
    console.log(`     Exemplo: ${example}`);
  }
});

// 4. Resumo
console.log('\n\n' + '='.repeat(60));
console.log('📊 RESUMO DA VALIDAÇÃO');
console.log('='.repeat(60));

if (missingFiles.length > 0) {
  console.log(`\n⚠️  ${missingFiles.length} arquivo(s) crítico(s) faltando`);
} else {
  console.log('\n✅ Todos os arquivos críticos presentes');
}

// 5. Próximos passos
console.log('\n\n🎯 PRÓXIMOS PASSOS RECOMENDADOS:\n');
console.log('1. Configure todas as variáveis de ambiente (.env)');
console.log('2. Execute: npm install');
console.log('3. Execute: npm run build (para verificar erros TypeScript)');
console.log('4. Aplique as migrações SQL em sql/migrations/ no PostgreSQL Azure');
console.log('5. Seed dados demo: node scripts/seed-demo.cjs');
console.log('6. Deploy: git push origin main (Azure Static Web Apps via GitHub Actions)');
console.log('\n');
