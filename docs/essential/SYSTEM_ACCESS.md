# 🎯 LOGIC VIEW BRIGHT - Informações de Acesso

**Gerado automaticamente em:** 04/01/2026, 19:42:59

---

## 🌐 URLS DO SISTEMA

### 🚀 Produção
- **URL Principal:** https://logic-view-bright-main.vercel.app
- **Domínio Customizado:** https://www.xyzlogicflow.tech
- **Supabase Dashboard:** https://supabase.com/dashboard

### 🔧 Desenvolvimento Local
- **URL Dev:** http://localhost:5173
- **Comando:** `npm run dev`

---

## 👥 CREDENCIAIS DE ACESSO (Ambiente de Teste)

### 🔑 ADMINISTRADOR
```
Email: admin@logicview.com
Senha: Admin@2024
URL: https://logic-view-bright-main.vercel.app/dashboard
```

**Permissões Completas:**
- ✅ Gestão de usuários e roles
- ✅ Configurações globais
- ✅ Todos os módulos (CRUD completo)
- ✅ Integrações e APIs

**Rotas Disponíveis:**
- `/dashboard` - Dashboard Principal
- `/drivers-management` - Gestão de Motoristas
- `/vehicles-management` - Gestão de Veículos
- `/trip-management` - Gestão de Viagens
- `/documents` - Documentos
- `/maintenance` - Manutenção
- `/logistics-kpi` - KPIs Logísticos
- `/approvals` - Aprovações
- `/settings` - Configurações
- `/users` - Gestão de Usuários
- `/eip` - Integrações

---

### 🚛 MOTORISTA
```
Email: motorista@logicview.com
Senha: Motorista@2024
URL: https://logic-view-bright-main.vercel.app/driver-app
```

**Funcionalidades:**
- ✅ Ver suas viagens
- ✅ Check-in/Check-out
- ✅ Upload de comprovantes
- ✅ Macros de viagem
- ✅ Consultar veículo vinculado
- ✅ Ver documentos pessoais

**Rotas Disponíveis:**
- `/driver-app` - App do Motorista
- `/driver-macros` - Macros de Viagem
- `/my-trips` - Minhas Viagens
- `/my-documents` - Meus Documentos

---

### 🔧 MECÂNICO
```
Email: mecanico@logicview.com
Senha: Mecanico@2024
URL: https://logic-view-bright-main.vercel.app/mechanic-app
```

**Funcionalidades:**
- ✅ Ver manutenções pendentes
- ✅ Registrar serviços realizados
- ✅ Upload de fotos/evidências
- ✅ Consultar histórico de veículos
- ✅ Requisitar peças
- ✅ Fechar ordens de serviço

**Rotas Disponíveis:**
- `/mechanic-app` - App do Mecânico
- `/maintenance` - Manutenção (leitura)
- `/work-orders` - Ordens de Serviço

---

### 📊 GESTOR
```
Email: gestor@logicview.com
Senha: Gestor@2024
URL: https://logic-view-bright-main.vercel.app/dashboard
```

**Funcionalidades:**
- ✅ Dashboard de KPIs
- ✅ Aprovações de viagens
- ✅ Relatórios gerenciais
- ✅ Visualizar motoristas e veículos
- ✅ Acompanhar viagens em tempo real
- ✅ Análise de custos

**Rotas Disponíveis:**
- `/dashboard` - Dashboard Gerencial
- `/logistics-kpi` - KPIs Logísticos
- `/approvals` - Aprovações
- `/reports` - Relatórios
- `/trip-management` - Gestão de Viagens (leitura)

---

## 🗂️ TABELAS DO BANCO DE DADOS

| Tabela | Criar | Ler | Editar | Excluir | Descrição |
|--------|:-----:|:---:|:------:|:-------:|-----------|
| `drivers` | ✅ | ✅ | ✅ | ✅ | Motoristas cadastrados |
| `vehicles` | ✅ | ✅ | ✅ | ✅ | Veículos da frota |
| `trips` | ✅ | ✅ | ✅ | ✅ | Viagens realizadas |
| `documents` | ✅ | ✅ | ❌ | ✅ | Documentos diversos |
| `maintenance_records` | ✅ | ✅ | ✅ | ⚠️ | Registros de manutenção |
| `driver_macros` | ✅ | ✅ | ✅ | ✅ | Macros de viagem |
| `approvals` | ✅ | ✅ | ✅ | ❌ | Fluxo de aprovações |
| `profiles` | ✅ | ✅ | ✅ | ⚠️ | Perfis de usuários |
| `roles` | ⚠️ | ✅ | ⚠️ | ❌ | Papéis/Permissões |

---

## 🚗 PLACAS DE VEÍCULOS (Formato Brasileiro)

### Exemplos Cadastrados
```
ABC-1234  (Caminhão - Ativo)
XYZ-5678  (Van - Ativo)
DEF-9012  (Carro - Manutenção)
GHI-3456  (Caminhão - Ativo)
JKL-7890  (Van - Ativo)
```

### Popular Placas Automaticamente
```bash
node scripts/seed-demo.cjs
```

---

## ⚙️ AUTOMAÇÕES E INTEGRAÇÕES

### 🤖 Automações Ativas

1. **Email Automático (EmailJS)**
   - ✅ Boas-vindas ao motorista
   - ✅ Notificação de viagem criada
   - ✅ Alerta de documento vencendo
   - ✅ Confirmação de aprovação

2. **WhatsApp Business**
   - ✅ Webhook: `/functions/whatsapp-webhook`
   - ✅ Notificações de viagem
   - ✅ Status de entrega
   - ✅ Comandos via chat

3. **OCR e IA**
   - ✅ Processamento de CNH
   - ✅ Validação de comprovantes
   - ✅ Extração de NF-e
   - ✅ Edge Function: `/functions/ocr-process`

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
```bash
npm install           # Instalar dependências
npm run dev           # Rodar localmente
npm run build         # Build de produção
npm run preview       # Preview do build
```

### Supabase
```bash
npx supabase login                          # Login
npx supabase link --project-ref YOUR_REF    # Linkar projeto
npx supabase db push                        # Push migrações
npx supabase functions deploy               # Deploy functions
```

### Deploy
```bash
vercel --prod         # Deploy produção
vercel                # Deploy preview
vercel logs --follow  # Ver logs
```

---

## 🐛 TROUBLESHOOTING

### Página em Branco
```bash
# 1. Verificar console (F12)
# 2. Verificar .env
# 3. Rebuild
npm run build
```

### Erro 502/503
```bash
# Verificar se deploy foi bem-sucedido
vercel logs
```

### Domínio não carrega
```bash
# Verificar DNS e configuração no Vercel
# Aguardar propagação DNS (até 48h)
```

---

## 📞 LINKS IMPORTANTES

- **GitHub:** https://github.com/logiccamila-wq/logic-view-bright
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard

---

**🎉 Sistema Logic View Bright - Pronto para Uso!**

**Versão:** 1.0.0  
**Última Atualização:** 04/01/2026, 19:42:59
