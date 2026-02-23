# Logic View Bright - Guia Rápido 🚀

> **Sistema 100% funcional** de gestão logística com deploy automatizado

---

## 📌 Links Importantes

- **Produção:** https://xyzlogicflow.tech
- **Login:** https://xyzlogicflow.tech/login
- **Dashboard Cloudflare:** https://dash.cloudflare.com
- **Dashboard Supabase:** https://supabase.com/dashboard

---

## 🎯 O Que É Este Sistema?

Sistema completo de gestão logística com:

- ✅ **TMS** - Gerenciamento de Transporte
- ✅ **WMS** - Gerenciamento de Armazém  
- ✅ **OMS** - Gerenciamento de Pedidos
- ✅ **CRM** - Relacionamento com Clientes
- ✅ **ERP** - Planejamento de Recursos
- ✅ **SCM** - Cadeia de Suprimentos
- ✅ **Integração Odoo** - Sincronização com ERP Odoo

**Stack Tecnológica:**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Deploy: Cloudflare Pages (auto-deploy)
- Domínio: xyzlogicflow.tech

---

## 🚀 Deploy Simplificado

### Configuração Limpa (SEM Netlify, SEM confusão!)

Este repositório foi **limpo e simplificado**. Agora usa apenas:

1. **Cloudflare Pages** - Frontend (deploy automático)
2. **Supabase** - Backend completo
3. *(Opcional)* Vercel como backup

**Arquivos removidos:**
- ❌ `.netlify/` - REMOVIDO (não usado)
- ❌ Configurações redundantes de deploy

**O que ficou:**
- ✅ Cloudflare Pages (principal)
- ✅ Supabase Edge Functions
- ✅ Vercel (backup, se precisar)

---

## 💻 Como Usar

### Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# 3. Rodar servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

### Fazer Deploy

```bash
# 1. Fazer commit
git add .
git commit -m "Minha alteração"

# 2. Push para main (faz deploy automático!)
git push origin main

# 3. Se alterou backend, deploy das functions
npm run deploy:functions
```

**É só isso!** O Cloudflare Pages detecta o push e faz deploy automaticamente.

---

## 🔑 Configuração de Ambiente

### Frontend (Cloudflare Pages)

Configurar em: https://dash.cloudflare.com → Pages → Settings

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_APP_URL=https://xyzlogicflow.tech
```

### Backend (Supabase)

Configurar em: https://supabase.com/dashboard → Settings → Edge Functions

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.pages.dev
```

**⚠️ IMPORTANTE:** Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend!

---

## 📖 Documentação

### Documentos Principais

1. **[DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md)** ⭐ LEIA PRIMEIRO
   - Guia simplificado de deploy
   - Como funciona tudo
   - Solução de problemas

2. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
   - Detalhes da implementação Odoo
   - Arquitetura técnica

3. **[README_FINAL.md](./README_FINAL.md)**
   - Documentação completa do sistema
   - Todos os módulos

4. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Guia detalhado de deploy
   - Configurações avançadas

### Documentos de Referência

- `CLOUDFLARE_PAGES_DEPLOYMENT.md` - Detalhes Cloudflare
- `ARCHITECTURE_UNIFIED.md` - Arquitetura do sistema
- `POST_DEPLOYMENT_CHECKLIST.md` - Checklist pós-deploy

---

## 🎓 Módulos Disponíveis

### Operações
- `/tms` - Transport Management System
- `/wms` - Warehouse Management System
- `/oms` - Order Management System
- `/scm` - Supply Chain Management

### Financeiro & Vendas
- `/erp` - Enterprise Resource Planning
- `/crm` - Customer Relationship Management
- `/revenue-analysis` - Análise de Receitas
- `/bank-reconciliation` - Conciliação Bancária

### Frota & Manutenção
- `/fleet` - Gestão de Frota
- `/drivers-management` - Gestão de Motoristas
- `/maintenance` - Manutenção
- `/predictive-maintenance` - Manutenção Preditiva

### Administrativo
- `/approvals` - Sistema de Aprovações
- `/users` - Gestão de Usuários
- `/permissions` - Permissões
- `/settings` - Configurações

### Integrações
- `/settings/odoo` - Integração com Odoo ERP

---

## 🐛 Problemas Comuns

### Página em Branco

**Solução:**
1. Verificar variáveis de ambiente no Cloudflare Pages
2. Fazer redeploy (Cloudflare → Deployments → Retry)

### Erro CORS

**Solução:**
1. Adicionar `ALLOWED_ORIGINS` no Supabase
2. Valor: `https://xyzlogicflow.tech,https://logic-view-bright.pages.dev`
3. Redeploy functions: `npm run deploy:functions`

### Build Falhou

**Solução:**
```bash
# Testar localmente
npm run build

# Ver o erro e corrigir
# Depois fazer commit e push
```

---

## 📊 Scripts Disponíveis

```bash
npm run dev              # Servidor desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
npm run check            # Verificar TypeScript
npm run lint             # Lint do código

npm run deploy:functions # Deploy Edge Functions
npm run deploy:all       # Deploy completo
npm run db:push          # Aplicar migrations
npm run db:reset         # Reset database
```

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

- Variáveis de ambiente separadas (frontend vs backend)
- Row Level Security (RLS) no Supabase
- CORS configurado corretamente
- Autenticação JWT
- SSL automático (Cloudflare)

### ⚠️ Nunca Faça Isso

- Commitar `.env` no git
- Expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Usar wildcards em CORS sem necessidade
- Compartilhar credenciais publicamente

---

## 🤝 Suporte

Se tiver problemas:

1. **Veja os logs:**
   - Cloudflare: https://dash.cloudflare.com → Deployments
   - Supabase: https://supabase.com/dashboard → Logs

2. **Consulte a documentação:**
   - [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) - Primeiro lugar!
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Detalhes avançados

3. **Teste localmente:**
   ```bash
   npm run dev
   npm run build
   ```

---

## ✨ Status Atual

- ✅ **Repositório limpo** - Sem configurações redundantes
- ✅ **Deploy automatizado** - Push no main = deploy
- ✅ **100% funcional** - Todos módulos operacionais
- ✅ **Documentação atualizada** - Tudo em português
- ✅ **Produção estável** - xyzlogicflow.tech online

---

**Versão:** 1.0.0  
**Data:** 03/02/2026  
**Status:** ✅ Produção  
**Mantido por:** Logic View Bright Team
