# 🗄️ Configuração do Banco de Dados Neon

## 📋 Pré-requisitos

1. Conta no **Neon** (https://neon.tech) - **GRÁTIS**
2. Projeto Next.js já configurado
3. Conta Vercel vinculada ao repositório

---

## 🚀 Setup Rápido (5 minutos)

### **Passo 1: Criar Banco no Neon**

1. Acesse https://console.neon.tech
2. Crie um novo projeto:
   - Nome: `optilog-app`
   - Região: `sa-east-1` (São Paulo)
   - Plan: **Free Tier** (0.5 GB, 100 horas/mês)
3. Após criar, copie a **Connection String**

### **Passo 2: Configurar Localmente**

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Neon PostgreSQL - Connection String
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require

# Neon REST API (opcional, para queries serverless)
NEON_REST_URL=https://ep-xxx-xxx.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=b0e4c9fa-4c2f-4870-a244-782996d4b593
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua-chave-aqui

# Outras configurações
NEXT_PUBLIC_DISABLE_FIREBASE=1
```

**⚠️ IMPORTANTE:**
- Substitua `username`, `password`, `ep-xxx-xxx` pelos valores reais do Neon
- O arquivo `.env.local` já está no `.gitignore` (não será commitado)

### **Passo 3: Configurar na Vercel**

1. Acesse https://vercel.com/logiccamila-wq/optilog-app
2. Vá em **Settings → Environment Variables**
3. Adicione as variáveis:

| Nome | Valor | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` do Neon | Production, Preview, Development |
| `NEON_REST_URL` | `https://ep-...` do Neon | Production, Preview, Development |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | `b0e4c9fa-4c2f-4870-a244-782996d4b593` | Production, Preview, Development |

4. Clique em **Save**
5. Faça um novo deploy (automático ao fazer push)

### **Passo 4: Criar Schema do Banco**

Execute o script de setup:

```powershell
# Instalar dependências (se ainda não instalou)
npm install

# Executar script de criação de tabelas + seed
node backend/scripts/db_setup_full.mjs
```

**O que esse script faz:**
- ✅ Cria 13 tabelas (users, vehicles, orders, invoices, etc.)
- ✅ Insere dados de exemplo (veículos, pedidos, faturas)
- ✅ Configura relacionamentos (foreign keys)
- ✅ Pronto para usar!

---

## 🔄 Integração Vercel + Neon (Recomendado)

### **Vantagens:**
- ✅ Branches de banco automáticos para cada PR
- ✅ Preview deployments com dados isolados
- ✅ Sincronização automática de variáveis de ambiente

### **Como Ativar:**

1. No **Neon Console** → Integrations → Vercel
2. Clique em **Connect**
3. Selecione o projeto `optilog-app`
4. Ative "Create a database branch for every preview deployment"

**Pronto!** Agora:
- Cada PR cria um branch `preview/pr-<número>`
- Deploy de preview usa banco isolado
- PR fechado = branch de banco deletado automaticamente

---

## 📊 Estrutura do Banco

### **Tabelas Criadas:**

```
users          → Usuários do sistema
customers      → Clientes
products       → Produtos/serviços
orders         → Pedidos
vehicles       → Veículos da frota
tires          → Pneus (rastreamento por posição)
shipments      → Entregas/cargas
maintenances   → Ordens de serviço (preventiva/corretiva)
invoices       → Faturas emitidas
receivables    → Contas a receber
payables       → Contas a pagar
alerts         → Alertas do sistema
checklist      → Checklists operacionais
estoque        → Controle de estoque
```

### **Dados de Exemplo:**

- 3 veículos com placas ABC-1234, XYZ-9876, QWE-5555
- 6 pneus rastreados por posição
- 4 entregas em andamento
- 3 manutenções agendadas
- Faturas, contas a receber/pagar
- Alertas e checklists

---

## 🧪 Testar Conexão

### **1. Via Script Node:**

```bash
node backend/test-neon.mjs
```

**Saída esperada:**
```
NEON_OK { ok: 1 }
```

### **2. Via Aplicação:**

```bash
npm run dev
```

Acesse: http://localhost:3000/status

Deve mostrar:
- ✅ Neon REST API: Configurado
- ✅ Conexão DB: OK

### **3. Via API:**

```bash
curl http://localhost:3000/api/posts
```

Deve retornar lista de posts (se seed foi executado).

---

## 🔧 Scripts Disponíveis

### **Setup Completo (recomendado):**
```bash
node backend/scripts/db_setup_full.mjs
```
→ Cria todas as tabelas + insere dados de exemplo

### **Setup Básico:**
```bash
node backend/scripts/db_setup.mjs
```
→ Apenas cria tabelas (sem dados)

### **Seed de Posts:**
```bash
node scripts/seed.mjs
```
→ Cria tabela `posts` + insere 3 artigos de exemplo

### **Migração SQLite → Postgres:**
```bash
DATABASE_URL="postgresql://..." node scripts/migrate-sqlite-to-postgres.js
```
→ Migra dados do SQLite antigo (se existir)

---

## 📈 Monitoramento

### **Neon Console:**
- Queries executadas
- Uso de storage (0.5 GB grátis)
- Horas de computação (100h/mês grátis)
- Branches ativos

### **Vercel Analytics:**
- Performance de APIs
- Latência de queries
- Erros de conexão

---

## 🆘 Troubleshooting

### **Erro: "DATABASE_URL não definido"**

✅ **Solução:**
1. Verifique se `.env.local` existe na raiz
2. Confirme que `DATABASE_URL` está preenchido
3. Reinicie o dev server: `npm run dev`

### **Erro: "Connection timeout"**

✅ **Solução:**
1. Verifique firewall/proxy
2. Confirme que `sslmode=require` está na URL
3. Teste conexão: `node backend/test-neon.mjs`

### **Erro: "relation does not exist"**

✅ **Solução:**
1. Execute o setup: `node backend/scripts/db_setup_full.mjs`
2. Verifique no Neon Console → SQL Editor se tabelas existem
3. Se não, rode novamente o script

### **Erro: "Too many connections"**

✅ **Solução:**
1. Neon Free Tier: máx 100 horas/mês
2. Use connection pooling (já configurado com `@neondatabase/serverless`)
3. Upgrade para plano pago se necessário

---

## 💰 Custos

### **Free Tier (Atual):**
- ✅ 0.5 GB storage
- ✅ 100 horas compute/mês
- ✅ 1 projeto
- ✅ Branches ilimitados (7 dias de retenção)
- ✅ 0 custo mensal

### **Quando Escalar:**
- **Launch Plan** ($19/mês): 10 GB, 300h, 10 projetos
- **Scale Plan** ($69/mês): 50 GB, ilimitado, autoscaling

**Para MVP atual:** Free Tier é **suficiente!** ✅

---

## 🎯 Próximos Passos

1. ✅ Configurar DATABASE_URL
2. ✅ Rodar setup do banco
3. ✅ Testar conexão
4. ⏭️ Integrar módulos com dados reais (substituir mock data)
5. ⏭️ Configurar autenticação Stack Auth
6. ⏭️ Implementar WebSocket para Torre de Controle
7. ⏭️ Deploy de produção

---

## 📚 Referências

- [Neon Docs](https://neon.tech/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js + Postgres](https://nextjs.org/learn/dashboard-app/setting-up-your-database)
- [Stack Auth Docs](https://docs.stack-auth.com/)

---

**Status:** ✅ Pronto para configurar!

**Tempo estimado:** 5-10 minutos

**Suporte:** contato@xyzlogicflow.tech
