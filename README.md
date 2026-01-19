# 🚀 Logic View Bright - Plataforma Logística Unificada

> **Status:** ✅ Sistema 100% Operacional em Produção  
> **Deploy:** <https://logic-view-bright-main.vercel.app>  
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

⚠️ **IMPORTANTE:** Nunca commite secrets no repositório. Configure as variáveis apenas nos dashboards de deploy.

### Frontend (Vercel)

Configure no [Vercel Dashboard](https://vercel.com/dashboard) → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Backend/Functions (Supabase)

Configure no Supabase Dashboard → Settings → Edge Functions:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.vercel.app
```

### Opcional (APIs Externas)

```env
VITE_EMAILJS_SERVICE_ID=<your-service-id>
VITE_EMAILJS_TEMPLATE_ID=<your-template-id>
VITE_EMAILJS_PUBLIC_KEY=<your-public-key>
VITE_OPENROUTE_API_KEY=<your-openroute-key>
VITE_TOMTOM_API_KEY=<your-tomtom-key>
AI_PROVIDER_KEY=<your-ai-provider-key>
AI_PROVIDER_MODEL=<your-model-name>
AI_PROVIDER_ENDPOINT=<your-endpoint-url>
```

## 🚀 Deployment

### Frontend
- **Platform:** Vercel (auto-deploy via GitHub integration)
- **Domain:** https://xyzlogicflow.tech
- **Preview:** https://logic-view-bright.vercel.app

### Backend/API
- **Platform:** Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase)
- **Note:** While the repo references Cloudflare for potential future API hosting, current production uses Supabase Edge Functions

Para deploy manual de functions:
```bash
npm run deploy:functions
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
