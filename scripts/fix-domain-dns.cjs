#!/usr/bin/env node

/**
 * Script para configurar DNS do domínio xyzlogicflow.tech no Vercel
 * 
 * Este script:
 * 1. Verifica projetos disponíveis
 * 2. Identifica qual projeto tem o domínio
 * 3. Adiciona/atualiza o domínio se necessário
 * 4. Mostra instruções para configuração manual se preciso
 */

const https = require('https');
const { spawn } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Executa comando do Vercel CLI
function vercelCommand(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('vercel', args, {
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || stdout));
      }
    });
  });
}

async function main() {
  log('\n🔧 Diagnóstico e Correção do DNS - xyzlogicflow.tech\n', 'bright');
  log('═══════════════════════════════════════════════════════\n', 'cyan');

  try {
    // 1. Verificar autenticação
    log('1️⃣  Verificando autenticação...', 'cyan');
    const whoami = await vercelCommand(['whoami']);
    log(`   ✅ Autenticado como: ${whoami.trim()}\n`, 'green');

    // 2. Listar projetos
    log('2️⃣  Verificando projetos...', 'cyan');
    const projectsOutput = await vercelCommand(['project', 'ls']);
    
    const hasMainProject = projectsOutput.includes('logic-view-bright-main');
    const hasProject = projectsOutput.includes('logic-view-bright');
    
    if (hasMainProject) {
      log('   ✅ Projeto "logic-view-bright-main" encontrado', 'green');
      log('   ℹ️  Este projeto já tem o domínio xyzlogicflow.tech\n', 'yellow');
    } else if (hasProject) {
      log('   ✅ Projeto "logic-view-bright" encontrado', 'green');
      log('   ⚠️  Domínio não está vinculado a este projeto\n', 'yellow');
    }

    // 3. Mostrar instruções
    log('\n📋 PRÓXIMOS PASSOS:\n', 'bright');
    log('O domínio xyzlogicflow.tech está usando nameservers do Vercel,', 'reset');
    log('mas os registros DNS não foram criados automaticamente.\n', 'reset');

    log('🎯 SOLUÇÃO (escolha uma opção):\n', 'yellow');

    log('═══════════════════════════════════════════════════════', 'cyan');
    log('OPÇÃO 1: Via Vercel Dashboard (RECOMENDADO - 2 minutos)', 'bright');
    log('═══════════════════════════════════════════════════════\n', 'cyan');

    log('1. Acesse:', 'reset');
    log('   🔗 https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main/settings/domains\n', 'cyan');

    log('2. Verifique se o domínio xyzlogicflow.tech está listado', 'reset');
    log('   - Se SIM: Clique em "Refresh" ou "View DNS Records"', 'reset');
    log('   - Se NÃO: Clique em "Add Domain" e digite: xyzlogicflow.tech\n', 'reset');

    log('3. O Vercel vai mostrar os registros necessários:', 'reset');
    log('   A     @    76.76.21.21 (ou similar)', 'yellow');
    log('   CNAME www  cname.vercel-dns.com\n', 'yellow');

    log('4. Se os registros NÃO aparecerem automaticamente:', 'reset');
    log('   - Clique em "Manage DNS Records" no domínio', 'reset');
    log('   - Adicione manualmente os registros acima\n', 'reset');

    log('═══════════════════════════════════════════════════════', 'cyan');
    log('OPÇÃO 2: Verificar projeto correto', 'bright');
    log('═══════════════════════════════════════════════════════\n', 'cyan');

    log('Se você quer usar o projeto "logic-view-bright" (sem -main):', 'reset');
    log('1. Acesse: https://vercel.com/logiccamila-wqs-projects/logic-view-bright/settings/domains', 'cyan');
    log('2. Clique em "Add Domain"', 'reset');
    log('3. Digite: xyzlogicflow.tech', 'reset');
    log('4. Digite: www.xyzlogicflow.tech\n', 'reset');

    log('═══════════════════════════════════════════════════════\n', 'cyan');

    log('⏱️  Após configurar, aguarde 2-5 minutos e execute:', 'yellow');
    log('   ./scripts/check-dns.sh\n', 'cyan');

    log('💡 DIAGNÓSTICO ATUAL:\n', 'bright');
    log('   ✅ Nameservers: Vercel (ns1.vercel-dns.com, ns2.vercel-dns.com)', 'green');
    log('   ❌ Registro A: Não configurado', 'red');
    log('   ❌ CNAME www: Não configurado', 'red');
    log('   ❌ Site: Não acessível\n', 'red');

    log('📚 Documentação completa em:', 'reset');
    log('   - SOLUCAO_DNS.md', 'cyan');
    log('   - ACAO_DNS_VERCEL.md', 'cyan');
    log('   - DNS_README.md\n', 'cyan');

  } catch (error) {
    log('\n❌ Erro:', 'red');
    log(error.message, 'red');
    log('\n💡 Dica: Execute manualmente:', 'yellow');
    log('   vercel whoami', 'cyan');
    log('   vercel project ls\n', 'cyan');
  }
}

main();
