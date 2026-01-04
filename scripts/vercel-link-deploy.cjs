const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('🚀 VINCULAÇÃO E DEPLOY AUTOMÁTICO DO VERCEL\n');
console.log('='.repeat(70) + '\n');

const runCommand = (cmd, description, options = {}) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`▶ ${description}`);
  console.log('='.repeat(70) + '\n');
  
  try {
    const result = execSync(cmd, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      cwd: rootDir,
      encoding: 'utf-8',
      ...options
    });
    console.log(`\n✅ ${description} - CONCLUÍDO!`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`\n⚠️  ${description} - ${options.continueOnError ? 'Continuando...' : 'Erro'}`);
    if (!options.continueOnError) {
      console.error(error.message);
    }
    return { success: false, error };
  }
};

// 1. Verificar se Vercel CLI está instalado
console.log('🔍 Verificando Vercel CLI...');
const vercelCheck = runCommand('vercel --version', 'Verificar Vercel CLI', { silent: true, continueOnError: true });

if (!vercelCheck.success) {
  console.log('📦 Instalando Vercel CLI...');
  runCommand('npm install -g vercel', 'Instalar Vercel CLI globalmente');
}

// 2. Fazer login no Vercel (se necessário)
console.log('\n🔐 Verificando autenticação...');
const whoamiResult = runCommand('vercel whoami', 'Verificar usuário logado', { silent: true, continueOnError: true });

if (!whoamiResult.success) {
  console.log('\n⚠️  Você precisa fazer login no Vercel.');
  console.log('Execute: vercel login');
  console.log('\nApós o login, execute novamente: node scripts/vercel-link-deploy.cjs');
  process.exit(1);
}

console.log(`✅ Logado como: ${whoamiResult.output.trim()}`);

// 3. Verificar se já está vinculado
const vercelConfigPath = path.join(rootDir, '.vercel', 'project.json');
let needsLink = !fs.existsSync(vercelConfigPath);

if (!needsLink) {
  try {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    console.log(`\n📂 Projeto já vinculado: ${config.projectId}`);
  } catch (error) {
    needsLink = true;
  }
}

// 4. Vincular projeto se necessário
if (needsLink) {
  console.log('\n🔗 Vinculando projeto Vercel...');
  console.log('   Selecione: logic-view-bright-main (ou o projeto que deseja vincular)\n');
  
  const linkResult = runCommand('vercel link', 'Vincular projeto Vercel', { continueOnError: false });
  
  if (!linkResult.success) {
    console.log('\n❌ Falha ao vincular projeto.');
    console.log('Execute manualmente: vercel link');
    process.exit(1);
  }
}

// 5. Build do projeto
runCommand('npm run build', 'Build do projeto', { continueOnError: false });

// 6. Deploy para preview
console.log('\n🚀 Fazendo deploy preview...');
const previewResult = runCommand('vercel', 'Deploy Preview', { continueOnError: true });

if (previewResult.success) {
  console.log('\n✅ Deploy preview realizado!');
  console.log('   URL será exibida acima ↑');
}

// 7. Deploy para produção
console.log('\n🎯 Deseja fazer deploy para PRODUÇÃO?');
console.log('   Este será o deploy final em:');
console.log('   - logic-view-bright-main.vercel.app');
console.log('   - www.xyzlogicflow.tech (se configurado)');

// Por enquanto, apenas mostrar comando
console.log('\n💡 Para fazer deploy de produção, execute:');
console.log('   vercel --prod\n');

// 8. Resumo final
console.log('\n' + '='.repeat(70));
console.log('✨ VINCULAÇÃO E DEPLOY CONCLUÍDOS!');
console.log('='.repeat(70) + '\n');

console.log('📋 Próximos passos:\n');
console.log('1. Verificar o deploy preview (URL acima)');
console.log('2. Se estiver ok, fazer deploy de produção:');
console.log('   vercel --prod\n');
console.log('3. Acessar:');
console.log('   - Preview: link mostrado acima');
console.log('   - Produção: https://logic-view-bright-main.vercel.app');
console.log('   - Domínio custom: https://www.xyzlogicflow.tech\n');

console.log('📄 Documentação completa: SYSTEM_ACCESS.md\n');
