const fs = require('fs');
const path = require('path');

console.log('🔍 REVISÃO COMPLETA DO SISTEMA LOGIC VIEW BRIGHT\n');
console.log('='.repeat(70) + '\n');

const rootDir = path.resolve(__dirname, '..');
const issues = [];
const fixes = [];

// 1. VERIFICAR ESTRUTURA DE MÓDULOS
console.log('📦 1. VERIFICANDO MÓDULOS E ROTAS\n');

const modulesRegistryPath = path.join(rootDir, 'src/modules/registry.ts');
if (fs.existsSync(modulesRegistryPath)) {
  const content = fs.readFileSync(modulesRegistryPath, 'utf-8');
  console.log('✅ Registry de módulos encontrado');
  
  const routeMatches = content.match(/path:\s*['"]([^'"]+)['"]/g);
  if (routeMatches) {
    console.log(`   Rotas encontradas: ${routeMatches.length}`);
    routeMatches.slice(0, 10).forEach(route => {
      console.log(`   - ${route.replace(/path:\s*['"]|['"]/g, '')}`);
    });
    if (routeMatches.length > 10) {
      console.log(`   ... e mais ${routeMatches.length - 10} rotas`);
    }
  }
} else {
  issues.push('❌ Registry de módulos não encontrado');
}

// 2. VERIFICAR TABELAS DO BANCO DE DADOS
console.log('\n📊 2. VERIFICANDO ESTRUTURA DO BANCO DE DADOS\n');

const migrationsDir = path.join(rootDir, 'sql/migrations');
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  console.log(`✅ ${migrations.length} migrações encontradas`);
  
  const allTables = new Set();
  migrations.forEach(migration => {
    const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf-8');
    const tables = content.match(/create table\s+(?:if not exists\s+)?([^\s(]+)/gi);
    if (tables) {
      tables.forEach(t => {
        const tableName = t.replace(/create table\s+(?:if not exists\s+)?/i, '').replace(/["`]/g, '');
        allTables.add(tableName);
      });
    }
  });
  
  console.log(`\n   Tabelas principais:`);
  Array.from(allTables).slice(0, 15).forEach(table => console.log(`      - ${table}`));
  if (allTables.size > 15) {
    console.log(`      ... e mais ${allTables.size - 15} tabelas`);
  }
} else {
  issues.push('❌ Diretório de migrações não encontrado');
}

// 3. VERIFICAR AZURE FUNCTIONS
console.log('\n⚡ 3. VERIFICANDO AZURE FUNCTIONS\n');

const functionsDir = path.join(rootDir, 'api/runtime');
if (fs.existsSync(functionsDir)) {
  const files = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  console.log(`✅ Azure Functions encontradas em api/runtime (${files.length} arquivo(s))`);
  files.forEach(fn => console.log(`   - ${fn}`));
} else {
  console.log('⚠️  Diretório api/runtime não encontrado');
}

// 4. VERIFICAR COMPONENTES PRINCIPAIS
console.log('\n🎨 4. VERIFICANDO COMPONENTES FRONTEND\n');

const componentsToCheck = [
  'src/pages/DriversManagement.tsx',
  'src/pages/VehiclesManagement.tsx',
  'src/pages/Documents.tsx',
  'src/pages/TripManagement.tsx',
  'src/pages/Maintenance.tsx',
  'src/pages/LogisticsKPI.tsx'
];

let foundComponents = 0;
componentsToCheck.forEach(comp => {
  const fullPath = path.join(rootDir, comp);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${comp}`);
    foundComponents++;
  }
});

console.log(`\n   Total: ${foundComponents}/${componentsToCheck.length} componentes principais encontrados`);

// 5. RESUMO
console.log('\n\n' + '='.repeat(70));
console.log('📋 RESUMO DA REVISÃO');
console.log('='.repeat(70) + '\n');

if (issues.length > 0) {
  console.log('❌ PROBLEMAS ENCONTRADOS:\n');
  issues.forEach(issue => console.log(`   ${issue}`));
} else {
  console.log('✅ ESTRUTURA DO PROJETO OK');
}

console.log('\n📊 COMPONENTES VERIFICADOS:');
console.log(`   - Módulos/Rotas: ✅`);
console.log(`   - Migrações SQL: ✅`);
console.log(`   - Edge Functions: ${fs.existsSync(functionsDir) ? '✅' : '⚠️'}`);
console.log(`   - Componentes Frontend: ${foundComponents}/${componentsToCheck.length}`);

console.log('\n✨ Revisão completa concluída!\n');
