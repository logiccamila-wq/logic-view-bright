#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de arquivos com erro segundo o TypeScript
const files = [
  'src/pages/AccountsPayable.tsx',
  'src/pages/AccountsReceivable.tsx',
  'src/pages/Approvals.tsx',
  'src/pages/BankReconciliation.tsx',
  'src/pages/CRM.tsx',
  'src/pages/CentrosCusto.tsx',
  'src/pages/ControlTower.tsx',
  'src/pages/DriversManagement.tsx',
  'src/pages/FolhaPagamento.tsx',
  'src/pages/Inventory.tsx',
  'src/pages/Lancamentos.tsx',
  'src/pages/Partners.tsx',
  'src/pages/PlanoContas.tsx',
];

console.log('🔧 Corrigindo arquivos com JSX sem elemento raiz...\n');

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove linhas vazias extras antes de export
  content = content.replace(/\n\s*\n\s*export default/g, '\n\nexport default');
  
  // Remove tags </Layout> sobrando
  content = content.replace(/\s*<\/Layout>\s*\n/g, '\n');
  
  // Encontra o return statement e garante que tem uma tag wrapper
  const returnMatch = content.match(/return\s*\(/);
  if (returnMatch) {
    const returnIndex = returnMatch.index + returnMatch[0].length;
    const afterReturn = content.substring(returnIndex);
    
    // Verifica se já tem um wrapper (div, fragment, etc)
    const hasWrapper = /^\s*<(?:div|>|Fragment|PageTransition)/.test(afterReturn);
    
    if (!hasWrapper) {
      console.log(`✅ Adicionando wrapper em: ${file}`);
      // Adiciona um fragment como wrapper
      const beforeReturn = content.substring(0, returnIndex);
      const closingParenIndex = content.lastIndexOf(');');
      const middle = content.substring(returnIndex, closingParenIndex).trim();
      
      fs.writeFileSync(filePath, 
        beforeReturn + '\n    <>\n      ' + 
        middle.replace(/\n/g, '\n      ') + 
        '\n    </>\n  );', 
        'utf8'
      );
    }
  }
  
  // Salva arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Corrigido: ${file}`);
});

console.log('\n🎯 Correção concluída!');
