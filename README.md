# 🚀 Logic View Bright - Plataforma Logística Unificada

> **Status:** ✅ Sistema 100% Operacional em Produção  
> **Deploy:** Cloudflare Pages  
> **Domínio:** <https://xyzlogicflow.tech>

---

## 📋 Documentação Completa

**Para informações completas do sistema, consulte: [README_FINAL.md](./README_FINAL.md)**

Contém:
- ✅ Status de todos os componentes
- 🔐 Credenciais de acesso
- 🏗️ Arquitetura detalhada  
- 📦 Lista completa de módulos
- 🛠️ Guias de desenvolvimento
- 🧪 Testes e validações

---

[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![Backend](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![Framework](https://img.shields.io/badge/Framework-React%2018-blue)](https://react.dev)

## 📐 Arquitetura

```
GitHub (Source) → Cloudflare Pages (Frontend) + Supabase (Backend + DB) → xyzlogicflow.tech
```

### Stack
- **Frontend:** React 18 + TypeScript + TailwindCSS + Vite
- **Backend:** Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase)
- **Deploy:** Cloudflare Pages (auto) + Supabase CLI

## 🚀 Deploy Rápido

```bash
# Deploy completo automatizado
./deploy.sh

# Ou manual
git push origin main              # Frontend (Cloudflare Pages auto-deploy)
npm run deploy:functions          # Edge Functions (Supabase)
```

## 📦 Comandos

```bash
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Build produção
npm run deploy:all       # Deploy completo
npm run db:push          # Aplicar migrations
```

## 🌿 Git: Branches em 5 Minutos

- **Criar/listar branches:** `git branch` (lista) · `git branch feature/logistica-kpi` (cria)
- **Trocar de branch:** `git switch feature/logistica-kpi` (ou `git checkout feature/logistica-kpi`)
- **Criar e já trocar:** `git switch -c hotfix/corrige-login` (ou `git checkout -b hotfix/corrige-login`)
- **Trazer main atualizada antes de trabalhar:** `git checkout main && git pull origin main`
- **Merge seguro:** `git checkout main && git pull origin main && git merge --no-ff feature/logistica-kpi && git push origin main` (após atualizar a feature com `git fetch origin && git rebase origin/main`)
- **Rebase para atualizar sua branch:** `git checkout feature/logistica-kpi && git fetch origin && git rebase origin/main`
- **Resolver conflitos e continuar rebase:** ajustar arquivos, `git add .` e `git rebase --continue`
- **Descartar rebase problemático:** `git rebase --abort`

## 🔐 Variáveis de Ambiente

**Frontend** (Cloudflare Pages Dashboard):
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_URL=https://xyzlogicflow.tech
```

**Backend** (Supabase Dashboard → Edge Functions):
```env
SUPABASE_SERVICE_ROLE_KEY=xxx
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.pages.dev
OPENAI_API_KEY=sk-xxx (optional)
```

**⚠️ Security:** Never add service role keys to Cloudflare Pages (frontend only)

## 📁 Estrutura

```
src/                  # Frontend React
├── components/      # UI components
├── pages/           # Páginas/Rotas
├── modules/         # Módulos do sistema
└── integrations/    # Supabase client

supabase/
├── functions/       # Edge Functions (Backend)
└── migrations/      # Database migrations
```

## 🎯 Módulos

- Fleet Management - Gestão de frota
- TMS - Transporte
- WMS - Armazém
- Financial - Financeiro
- CRM - Clientes
- Reports - KPIs e Relatórios

## 🌐 URLs

- **Produção:** https://xyzlogicflow.tech
- **Cloudflare Pages:** https://logic-view-bright.pages.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Supabase Dashboard:** https://supabase.com/dashboard

## 📖 Documentação

- [Cloudflare Pages Deployment](CLOUDFLARE_PAGES_DEPLOYMENT.md) - Complete guide
- [Deployment Guide](DEPLOYMENT.md) - General deployment info
- [Innovation Roadmap](INNOVATION_ROADMAP.md)

---

**⚠️ Deployment Platform:** This project uses Cloudflare Pages for frontend hosting. Vercel references have been removed.
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
