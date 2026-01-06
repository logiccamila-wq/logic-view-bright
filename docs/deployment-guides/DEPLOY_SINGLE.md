# Deploy Único - Vercel + Supabase

## ✅ Arquitetura Final

- **Frontend:** Vercel (GitHub Auto-Deploy)
- **Backend:** Supabase Edge Functions
- **Banco de Dados:** Supabase PostgreSQL
- **Domínio:** xyzlogicflow.tech → Vercel

## 🚀 Como Fazer Deploy

### 1. Frontend (Automático)
```bash
git add .
git commit -m "Deploy via Vercel"
git push origin main
```
Vercel faz deploy automático ao detectar push na branch `main`.

### 2. Edge Functions Supabase
```bash
# Deploy de todas as functions
npm run deploy:functions

# Ou deploy individual
supabase functions deploy <nome-da-function>
```

### 3. Migrations do Banco
```bash
# Aplicar migrations
npm run db:push

# Ou via Supabase CLI
supabase db push
```

## 📋 Variáveis de Ambiente

### Vercel (.env.production)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

### Supabase Edge Functions
Configure no painel Supabase → Settings → Edge Functions:
```
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
WHATSAPP_TOKEN=...
```

## 🔧 Scripts Disponíveis

```bash
npm run build          # Build do frontend
npm run preview        # Preview local
npm run deploy:all     # Deploy completo (Vercel + Supabase)
npm run db:reset       # Reset do banco com seed
```

## ⚠️ NÃO Use Mais

- ❌ Cloudflare Pages
- ❌ Netlify
- ❌ Pasta `/functions` (agora é `/supabase/functions`)
- ❌ Pasta `/api` (movido para Supabase)

## 🌐 URLs

- **Produção:** https://xyzlogicflow.tech
- **Vercel:** https://logic-view-bright-main.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/seu-projeto
