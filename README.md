# Logic View Bright — Optilog.app

Sistema web de gestão logística construído em **React + TypeScript + Vite**, com autenticação e banco de dados via **Supabase** e deploy no **Vercel**.

## Stack Principal

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Backend / Auth / DB** | Supabase (PostgreSQL + Edge Functions + Auth) |
| **Deploy Frontend** | Vercel (auto-deploy via GitHub `main`) |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy-vercel.yml`) |
| **Domínio** | xyzlogicflow.tech |

> ⚠️ **Azure Static Web Apps** é uma opção alternativa não recomendada. Consulte [AZURE_STATIC_WEB_APPS_DEPLOY.md](./AZURE_STATIC_WEB_APPS_DEPLOY.md) para detalhes.

## Variáveis de Ambiente

As variáveis estão divididas em dois escopos:

### Client-side (`VITE_` — públicas, seguras para o bundle)

Configure no [Vercel Dashboard → Environment Variables](https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables):

| Variável | Descrição | Escopos |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Production · Preview · Development |
| `VITE_SUPABASE_ANON_KEY` | Chave anon/pública do Supabase | Production · Preview · Development |
| `VITE_APP_URL` | URL pública da aplicação | Production |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | Production · Preview |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | Production · Preview |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | Production · Preview |
| `VITE_OPENROUTE_API_KEY` | OpenRouteService API key | Production · Preview |
| `VITE_TOMTOM_API_KEY` | TomTom API key | Production · Preview |

> **⚠️ NUNCA adicione `SUPABASE_SERVICE_ROLE_KEY` ou outros segredos ao Vercel.**
> Variáveis `VITE_` são embutidas no bundle e visíveis para o usuário final.

### Server-side (sem `VITE_` — segredos, somente no Supabase)

Configure no [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard/project/_/settings/functions):

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role — bypassa RLS, **nunca no frontend** |
| `SUPABASE_JWT_SECRET` | JWT secret para verificação de tokens |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (ex: `https://xyzlogicflow.tech`) |
| `AI_PROVIDER_KEY` | Chave da API de IA |
| `OPENAI_API_KEY` | OpenAI API key (se aplicável) |

## Como Rodar Localmente

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie o arquivo de exemplo e preencha as variáveis:

   ```bash
   cp .env.example .env.local
   # Edite .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY reais
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:5173](http://localhost:5173)

## Scripts Úteis

```bash
npm run dev               # Servidor de desenvolvimento (Vite)
npm run build             # Build de produção
npm run check             # TypeScript check (--noEmit)
npm run lint              # ESLint
npm run deploy:all        # Build + git push + deploy functions
npm run deploy:functions  # Deploy Edge Functions no Supabase
npm run db:push           # Aplicar migrations no Supabase
npm run db:reset          # Reset do banco com seed
```

## Deploy

### Frontend (Automático via Vercel)

```bash
git push origin main   # Vercel detecta e faz deploy automaticamente
```

### Edge Functions (Manual)

```bash
supabase login
supabase link --project-ref <project-ref>
npm run deploy:functions
```

Para instruções completas, consulte [DEPLOYMENT.md](./DEPLOYMENT.md).

## Auditoria de Segurança

- ✅ Nenhuma chave `SUPABASE_SERVICE_ROLE_KEY` ou `JWT_SECRET` referenciada via `VITE_` no código cliente
- ✅ `src/integrations/supabase/client.ts` usa apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (chaves públicas)
- ✅ Scripts de seed/admin usam `SUPABASE_SERVICE_ROLE_KEY` apenas em Node.js server-side
- ✅ Edge Functions leem `SUPABASE_SERVICE_ROLE_KEY` via variáveis de ambiente server-side

## Documentação

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Guia completo de deploy (Vercel + Supabase)
- **[README_FINAL.md](./README_FINAL.md)** — Documentação completa do sistema
- **[docs/deployment-guides/DEPLOY_SINGLE.md](./docs/deployment-guides/DEPLOY_SINGLE.md)** — Quick-start Vercel
