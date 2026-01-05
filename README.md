# 🚀 Logic View Bright - Plataforma Logística Unificada

> Sistema completo de gestão logística com arquitetura moderna: Vercel + Supabase

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![Framework](https://img.shields.io/badge/Framework-React%2018-blue)](https://react.dev)

## 📐 Arquitetura

```
GitHub (Source) → Vercel (Frontend) + Supabase (Backend + DB) → xyzlogicflow.tech
```

### Stack
- **Frontend:** React 18 + TypeScript + TailwindCSS + Vite
- **Backend:** Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase)
- **Deploy:** Vercel (auto) + Supabase CLI

## 🚀 Deploy Rápido

```bash
# Deploy completo automatizado
./deploy.sh

# Ou manual
git push origin main              # Frontend (Vercel auto-deploy)
npm run deploy:functions          # Edge Functions (Supabase)
```

## 📦 Comandos

```bash
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Build produção
npm run deploy:all       # Deploy completo
npm run db:push          # Aplicar migrations
```

## 🔐 Variáveis de Ambiente

**Frontend** (.env.local):
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Supabase** (Dashboard → Settings → Edge Functions):
```env
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=sk-xxx
```

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
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard

## 📖 Documentação

- [Deploy Completo](DEPLOY_SINGLE.md)
- [Setup Usuários](SETUP_USUARIOS.md)
- [Innovation Roadmap](INNOVATION_ROADMAP.md)

---

**⚠️ Arquitetura Unificada:** Este projeto usa APENAS Vercel + Supabase. Cloudflare e Netlify foram removidos.
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
