const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO PROJETOS VERCEL\n');
console.log('='.repeat(70) + '\n');

const rootDir = path.resolve(__dirname, '..');

// 1. Verificar projeto vinculado localmente
console.log('📂 Projeto vinculado localmente:\n');
const vercelJsonPath = path.join(rootDir, '.vercel', 'project.json');

if (fs.existsSync(vercelJsonPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    console.log(`   ✅ Project ID: ${config.projectId}`);
    console.log(`   ✅ Org ID: ${config.orgId}\n`);
  } catch (error) {
    console.log('   ❌ Erro ao ler .vercel/project.json\n');
  }
} else {
  console.log('   ⚠️  Nenhum projeto vinculado ainda\n');
  console.log('   Execute: vercel link\n');
}

// 2. Verificar qual está no repositório GitHub
console.log('🔗 Verificando repositório GitHub vinculado:\n');

try {
  const gitRemote = execSync('git remote get-url origin', { 
    encoding: 'utf-8',
    cwd: rootDir 
  }).trim();
  
  console.log(`   Repository: ${gitRemote}`);
  
  if (gitRemote.includes('logic-view-bright')) {
    console.log('   ✅ Repositório correto: logic-view-bright\n');
  }
} catch (error) {
  console.log('   ⚠️  Sem repositório Git configurado\n');
}

// 3. Verificar se Vercel CLI está instalado
console.log('🔧 Verificando Vercel CLI:\n');

try {
  const vercelVersion = execSync('vercel --version', { 
    encoding: 'utf-8',
    cwd: rootDir 
  }).trim();
  console.log(`   ✅ Vercel CLI: ${vercelVersion}\n`);
} catch (error) {
  console.log('   ❌ Vercel CLI não instalado\n');
  console.log('   Instale com: npm i -g vercel\n');
}

// 4. Tentar listar projetos
console.log('📋 Tentando listar projetos Vercel:\n');

try {
  execSync('vercel ls 2>/dev/null', { 
    stdio: 'inherit',
    cwd: rootDir 
  });
} catch (error) {
  console.log('   ⚠️  Não foi possível listar projetos\n');
  console.log('   Execute: vercel login (se não estiver autenticado)\n');
}

// 5. Recomendações
console.log('\n' + '='.repeat(70));
console.log('💡 INFORMAÇÕES DOS PROJETOS');
console.log('='.repeat(70) + '\n');

console.log('Baseado nas imagens compartilhadas, você tem:\n');
console.log('1️⃣  logic-view-bright-main.vercel.app');
console.log('   - Mais recente (commit há 12h)');
console.log('   - Status: Ativo\n');

console.log('2️⃣  www.xyzlogicflow.tech');
console.log('   - Commit há 2 dias');
console.log('   - Status: Página em branco (possível erro)\n');

console.log('🎯 PRÓXIMOS PASSOS:\n');
console.log('   1. Vincular ao projeto correto:');
console.log('      vercel link\n');
console.log('   2. Fazer deploy:');
console.log('      vercel --prod\n');
console.log('   3. Verificar o resultado em:\n');
console.log('      - https://logic-view-bright-main.vercel.app');
console.log('      - https://www.xyzlogicflow.tech\n');
