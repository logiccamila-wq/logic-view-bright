const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('⚡ EXECUTANDO TODOS OS PROCESSOS AUTOMATICAMENTE\n');
console.log('='.repeat(70) + '\n');

const runCommand = (cmd, description, optional = false) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`▶ ${description}`);
  console.log('='.repeat(70) + '\n');
  
  try {
    execSync(cmd, { stdio: 'inherit', cwd: rootDir, timeout: 300000 });
    console.log(`\n✅ ${description} - CONCLUÍDO!`);
    return true;
  } catch (error) {
    if (optional) {
      console.log(`\n⚠️  ${description} - Pulado (não crítico)`);
      return false;
    }
    console.log(`\n❌ ${description} - ERRO`);
    return false;
  }
};

// 1. Auto-fix
runCommand('node scripts/auto-fix.cjs', '1️⃣ Auto-Fix e Correções', true);

// 2. Revisão completa
runCommand('node scripts/complete-review.cjs', '2️⃣ Revisão Completa', true);

// 3. Gerar documentação
console.log(`\n${'='.repeat(70)}`);
console.log('▶ 3️⃣ Gerando Documentação de Acesso');
console.log('='.repeat(70) + '\n');

const accessDoc = `# 🎯 LOGIC VIEW BRIGHT - Informações de Acesso

**Gerado automaticamente em:** ${new Date().toLocaleString('pt-BR')}

---

## 🌐 URLS DO SISTEMA

### 🚀 Produção
- **URL Principal:** https://www.xyzlogicflow.com.br
- **Domínio Customizado:** https://www.xyzlogicflow.com.br
- **Azure Portal:** https://portal.azure.com

### 🔧 Desenvolvimento Local
- **URL Dev:** http://localhost:5173
- **Comando:** \`npm run dev\`

---

## 👥 CREDENCIAIS DE ACESSO (Ambiente de Teste)

### 🔑 ADMINISTRADOR
\`\`\`
Email: admin@logicview.com
Senha: Admin@2024
URL: https://www.xyzlogicflow.com.br/dashboard
\`\`\`

**Permissões Completas:**
- ✅ Gestão de usuários e roles
- ✅ Configurações globais
- ✅ Todos os módulos (CRUD completo)
- ✅ Integrações e APIs

**Rotas Disponíveis:**
- \`/dashboard\` - Dashboard Principal
- \`/drivers-management\` - Gestão de Motoristas
- \`/vehicles-management\` - Gestão de Veículos
- \`/trip-management\` - Gestão de Viagens
- \`/documents\` - Documentos
- \`/maintenance\` - Manutenção
- \`/logistics-kpi\` - KPIs Logísticos
- \`/approvals\` - Aprovações
- \`/settings\` - Configurações
- \`/users\` - Gestão de Usuários
- \`/eip\` - Integrações

---

### 🚛 MOTORISTA
\`\`\`
Email: motorista@logicview.com
Senha: Motorista@2024
URL: https://www.xyzlogicflow.com.br/driver-app
\`\`\`

**Funcionalidades:**
- ✅ Ver suas viagens
- ✅ Check-in/Check-out
- ✅ Upload de comprovantes
- ✅ Macros de viagem
- ✅ Consultar veículo vinculado
- ✅ Ver documentos pessoais

**Rotas Disponíveis:**
- \`/driver-app\` - App do Motorista
- \`/driver-macros\` - Macros de Viagem
- \`/my-trips\` - Minhas Viagens
- \`/my-documents\` - Meus Documentos

---

### 🔧 MECÂNICO
\`\`\`
Email: mecanico@logicview.com
Senha: Mecanico@2024
URL: https://www.xyzlogicflow.com.br/mechanic-app
\`\`\`

**Funcionalidades:**
- ✅ Ver manutenções pendentes
- ✅ Registrar serviços realizados
- ✅ Upload de fotos/evidências
- ✅ Consultar histórico de veículos
- ✅ Requisitar peças
- ✅ Fechar ordens de serviço

**Rotas Disponíveis:**
- \`/mechanic-app\` - App do Mecânico
- \`/maintenance\` - Manutenção (leitura)
- \`/work-orders\` - Ordens de Serviço

---

### 📊 GESTOR
\`\`\`
Email: gestor@logicview.com
Senha: Gestor@2024
URL: https://www.xyzlogicflow.com.br/dashboard
\`\`\`

**Funcionalidades:**
- ✅ Dashboard de KPIs
- ✅ Aprovações de viagens
- ✅ Relatórios gerenciais
- ✅ Visualizar motoristas e veículos
- ✅ Acompanhar viagens em tempo real
- ✅ Análise de custos

**Rotas Disponíveis:**
- \`/dashboard\` - Dashboard Gerencial
- \`/logistics-kpi\` - KPIs Logísticos
- \`/approvals\` - Aprovações
- \`/reports\` - Relatórios
- \`/trip-management\` - Gestão de Viagens (leitura)

---

## 🗂️ TABELAS DO BANCO DE DADOS

| Tabela | Criar | Ler | Editar | Excluir | Descrição |
|--------|:-----:|:---:|:------:|:-------:|-----------|
| \`drivers\` | ✅ | ✅ | ✅ | ✅ | Motoristas cadastrados |
| \`vehicles\` | ✅ | ✅ | ✅ | ✅ | Veículos da frota |
| \`trips\` | ✅ | ✅ | ✅ | ✅ | Viagens realizadas |
| \`documents\` | ✅ | ✅ | ❌ | ✅ | Documentos diversos |
| \`maintenance_records\` | ✅ | ✅ | ✅ | ⚠️ | Registros de manutenção |
| \`driver_macros\` | ✅ | ✅ | ✅ | ✅ | Macros de viagem |
| \`approvals\` | ✅ | ✅ | ✅ | ❌ | Fluxo de aprovações |
| \`profiles\` | ✅ | ✅ | ✅ | ⚠️ | Perfis de usuários |
| \`roles\` | ⚠️ | ✅ | ⚠️ | ❌ | Papéis/Permissões |

---

## 🚗 PLACAS DE VEÍCULOS (Formato Brasileiro)

### Exemplos Cadastrados
\`\`\`
ABC-1234  (Caminhão - Ativo)
XYZ-5678  (Van - Ativo)
DEF-9012  (Carro - Manutenção)
GHI-3456  (Caminhão - Ativo)
JKL-7890  (Van - Ativo)
\`\`\`

### Popular Placas Automaticamente
\`\`\`bash
node scripts/seed-demo.cjs
\`\`\`

---

## ⚙️ AUTOMAÇÕES E INTEGRAÇÕES

### 🤖 Automações Ativas

1. **Email Automático (EmailJS)**
   - ✅ Boas-vindas ao motorista
   - ✅ Notificação de viagem criada
   - ✅ Alerta de documento vencendo
   - ✅ Confirmação de aprovação

2. **WhatsApp Business**
   - ✅ Webhook: \`/functions/whatsapp-webhook\`
   - ✅ Notificações de viagem
   - ✅ Status de entrega
   - ✅ Comandos via chat

3. **OCR e IA**
   - ✅ Processamento de CNH
   - ✅ Validação de comprovantes
   - ✅ Extração de NF-e
   - ✅ Edge Function: \`/functions/ocr-process\`

4. **Workflows**
   - ✅ Aprovação multi-nível
   - ✅ Alerta de manutenção preventiva
   - ✅ Renovação automática de documentos

---

## 🔐 MATRIZ DE PERMISSÕES

| Funcionalidade | Admin | Gestor | Motorista | Mecânico |
|----------------|:-----:|:------:|:---------:|:--------:|
| Criar motorista | ✅ | ✅ | ❌ | ❌ |
| Editar motorista | ✅ | ✅ | ⚠️ | ❌ |
| Excluir motorista | ✅ | ❌ | ❌ | ❌ |
| Criar veículo | ✅ | ✅ | ❌ | ❌ |
| Editar veículo | ✅ | ✅ | ❌ | ⚠️ |
| Criar viagem | ✅ | ✅ | ⚠️ | ❌ |
| Finalizar viagem | ✅ | ✅ | ✅ | ❌ |
| Aprovar viagem | ✅ | ✅ | ❌ | ❌ |
| Criar manutenção | ✅ | ✅ | ❌ | ✅ |
| Fechar OS | ✅ | ✅ | ❌ | ✅ |
| Ver KPIs | ✅ | ✅ | ⚠️ | ❌ |
| Configurações | ✅ | ❌ | ❌ | ❌ |

---

## 🛠️ COMANDOS ÚTEIS

### Desenvolvimento
\`\`\`bash
npm install           # Instalar dependências
npm run dev           # Rodar localmente
npm run build         # Build de produção
npm run preview       # Preview do build
\`\`\`

### Azure PostgreSQL
\`\`\`bash


# Apply SQL migrations from sql/migrations/ to Azure PostgreSQL

\`\`\`

### Deploy (Azure Static Web Apps)
\`\`\`bash
git push origin main   # Deploy via GitHub Actions → Azure SWA
# View logs in Azure Portal or GitHub Actions
\`\`\`

---

## 🐛 TROUBLESHOOTING

### Página em Branco
\`\`\`bash
# 1. Verificar console (F12)
# 2. Verificar .env
# 3. Rebuild
npm run build
\`\`\`

### Erro 502/503 (Azure)
\`\`\`bash
# Verificar se deploy foi bem-sucedido
# Check GitHub Actions logs or Azure SWA logs
\`\`\`

### Domínio não carrega
\`\`\`bash
# Verificar DNS e configuração no Azure DNS
# Aguardar propagação DNS (até 48h)
\`\`\`

---

## 📞 LINKS IMPORTANTES

- **GitHub:** https://github.com/logiccamila-wq/logic-view-bright
- **Azure Portal:** https://portal.azure.com


---

**🎉 Sistema Logic View Bright - Pronto para Uso!**

**Versão:** 1.0.0  
**Última Atualização:** ${new Date().toLocaleString('pt-BR')}
`;

try {
  fs.writeFileSync(path.join(rootDir, 'SYSTEM_ACCESS.md'), accessDoc);
  console.log('✅ SYSTEM_ACCESS.md criado!\n');
  console.log('📄 Arquivo criado: SYSTEM_ACCESS.md');
  console.log('   Contém todas as credenciais e informações de acesso\n');
} catch (error) {
  console.log('⚠️  Erro ao criar SYSTEM_ACCESS.md:', error.message);
}

// Resumo final
console.log('\n' + '='.repeat(70));
console.log('✨ EXECUÇÃO CONCLUÍDA!');
console.log('='.repeat(70) + '\n');

console.log('📋 Arquivos Gerados:');
console.log('   ✅ SYSTEM_ACCESS.md (documentação completa)\n');

console.log('🌐 URLs do Sistema:');
console.log('   - Produção: https://www.xyzlogicflow.com.br');
console.log('   - Domínio: https://www.xyzlogicflow.com.br');
console.log('   - Local: http://localhost:5173\n');

console.log('🔑 Credenciais de Teste (ver SYSTEM_ACCESS.md):');
console.log('   - Admin: admin@logicview.com / Admin@2024');
console.log('   - Motorista: motorista@logicview.com / Motorista@2024');
console.log('   - Mecânico: mecanico@logicview.com / Mecanico@2024');
console.log('   - Gestor: gestor@logicview.com / Gestor@2024\n');

console.log('🚀 Próximos Passos:');
console.log('   1. Abra SYSTEM_ACCESS.md para ver todas as informações');
console.log('   2. Para rodar local: npm run dev');
console.log('   3. Para deploy: git push origin main   # Deploy via GitHub Actions → Azure SWA
console.log('   4. Aguarde propagação DNS do domínio (se necessário)\n');
