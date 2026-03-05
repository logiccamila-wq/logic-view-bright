#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/AccountsPayable.tsx',
  'src/pages/AccountsReceivable.tsx',
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

console.log('🔧 Corrigindo múltiplos elementos raiz JSX...\n');

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - não encontrado`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Encontrar o "return (" e contar elementos raiz
  const lines = content.split('\n');
  let inReturn = false;
  let returnLineIndex = -1;
  let indent = '';
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\s*return\s*\(/)) {
      inReturn = true;
      returnLineIndex = i;
      // Captura indentação
      const match = lines[i].match(/^(\s*)/);
      indent = match ? match[1] : '';
      break;
    }
  }
  
  if (returnLineIndex === -1) {
    console.log(`⚠️  ${file} - return não encontrado`);
    return;
  }
  
  // Adicionar Fragment logo após o return (
  lines[returnLineIndex] = lines[returnLineIndex].replace(/return\s*\(/, 'return (\n' + indent + '  <>');
  
  // Encontrar o fechamento ); e adicionar </> antes
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^\s*\);\s*$/) && i > returnLineIndex) {
      lines[i] = indent + '  </>\n' + lines[i];
      break;
    }
  }
  
  content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file}`);
});

console.log('\n🎯 Correção concluída!');
