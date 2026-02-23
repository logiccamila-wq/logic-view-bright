# Estratégia de Deploy Simplificada 🚀

**Data:** 03/02/2026  
**Status:** ✅ Produção

---

## 🎯 Resumo Rápido

Este repositório usa uma estratégia de deploy **simples e automatizada**:

- **Frontend:** Cloudflare Pages (deploy automático do branch `main`)
- **Backend:** Supabase Edge Functions (deploy manual via CLI)
- **Domínio:** xyzlogicflow.tech (gerenciado pelo Cloudflare)

---

## 📦 Plataformas Ativas

### 1. Cloudflare Pages (Frontend) - PRINCIPAL ✅

**O que é:** Hospedagem do frontend React/Vite

**Como funciona:**
- Push no branch `main` → deploy automático
- Build: `npm run build` → pasta `dist/`
- Domínio customizado: https://xyzlogicflow.tech
- URL alternativa: https://logic-view-bright.pages.dev

**Configuração:**
```bash
# Não precisa fazer nada manualmente
git push origin main  # Isso já faz o deploy!
```

**Variáveis de ambiente necessárias (Cloudflare Pages):**
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase
- `VITE_APP_URL`: https://xyzlogicflow.tech

**Onde configurar:**
1. https://dash.cloudflare.com
2. Workers & Pages → logic-view-bright
3. Settings → Environment Variables

---

### 2. Supabase (Backend) - PRINCIPAL ✅

**O que é:** Backend completo (database + API + auth + functions)

**Componentes:**
- PostgreSQL database
- Edge Functions (39 funções)
- Autenticação
- Storage
- Real-time

**Deploy de Edge Functions:**
```bash
# Fazer login (primeira vez)
supabase login

# Deployar todas as funções
npm run deploy:functions

# Ou manualmente
supabase functions deploy --no-verify-jwt
```

**Variáveis de ambiente necessárias (Supabase Edge Functions):**
- `SUPABASE_URL`: URL do projeto
- `SUPABASE_SERVICE_ROLE_KEY`: Chave secreta (nunca expor no frontend!)
- `ALLOWED_ORIGINS`: https://xyzlogicflow.tech,https://logic-view-bright.pages.dev

**Onde configurar:**
1. https://supabase.com/dashboard
2. Seu projeto → Settings → Edge Functions
3. Environment Variables

---

### 3. Vercel (Backup) - OPCIONAL ⚠️

**Status:** Configurado mas não é a plataforma principal

Mantemos a configuração do Vercel como **backup** caso precise fazer deploy alternativo, mas **Cloudflare é a plataforma principal**.

Se precisar usar Vercel:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🚀 Como Fazer Deploy

### Deploy Completo (Frontend + Backend)

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Suas mudanças"

# 2. Push para GitHub (isso faz deploy automático do frontend)
git push origin main

# 3. Deploy das Edge Functions (se modificou backend)
npm run deploy:functions
```

### Apenas Frontend

```bash
git push origin main
# Cloudflare Pages faz deploy automaticamente
```

### Apenas Backend

```bash
npm run deploy:functions
```

---

## 🔐 Segurança - IMPORTANTE

### ⚠️ O Que NUNCA Colocar no Cloudflare Pages

- ❌ `SUPABASE_SERVICE_ROLE_KEY` (apenas no Supabase!)
- ❌ Chaves de API privadas
- ❌ Senhas ou tokens secretos

### ✅ O Que Pode Estar no Frontend

- ✅ `VITE_SUPABASE_URL` (público)
- ✅ `VITE_SUPABASE_ANON_KEY` (público, tem RLS)
- ✅ URLs públicas

**Motivo:** Tudo no Cloudflare Pages é incluído no bundle JavaScript e fica público!

---

## 📁 Estrutura do Projeto

```
logic-view-bright/
├── src/                    # Código React (frontend)
├── supabase/
│   ├── functions/          # Edge Functions (backend)
│   └── migrations/         # Migrations do banco
├── dist/                   # Build do frontend (ignorado no git)
├── .vercel/               # Config Vercel (backup)
├── package.json           # Dependências
├── vite.config.ts        # Config Vite
└── index.html            # Entry point
```

---

## 🔍 Verificação de Deploy

Depois de fazer deploy, verifique:

1. **Frontend:** https://xyzlogicflow.tech
   - Deve carregar sem erros
   - Abra o console (F12) e veja se não tem erros

2. **Login:** https://xyzlogicflow.tech/login
   - Teste login com credenciais válidas
   - Deve funcionar

3. **Edge Functions:**
   - Navegue pelos módulos
   - Dados devem carregar
   - Se tiver erro de CORS, veja seção abaixo

---

## 🐛 Solução de Problemas

### Erro: Página em Branco

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Cloudflare Dashboard → Pages → logic-view-bright
2. Settings → Environment Variables
3. Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Fazer redeploy (Deployments → Retry)

### Erro: CORS / Network Error

**Causa:** `ALLOWED_ORIGINS` não configurado no Supabase

**Solução:**
1. Supabase Dashboard → Settings → Edge Functions
2. Adicionar variável `ALLOWED_ORIGINS`
3. Valor: `https://xyzlogicflow.tech,https://logic-view-bright.pages.dev`
4. Redeploy functions: `npm run deploy:functions`

### Erro: Build Failed

**Solução:**
```bash
# Testar build localmente
npm run build

# Se der erro, corrigir e commitar
git add .
git commit -m "Fix build"
git push origin main
```

---

## 📊 Status Atual

- ✅ Cloudflare Pages: ONLINE
- ✅ Supabase Backend: ONLINE
- ✅ Domínio: xyzlogicflow.tech configurado
- ✅ SSL: Automático pelo Cloudflare
- ✅ Auto-deploy: Ativo no branch main

---

## 📚 Documentação Adicional

- **Deploy detalhado:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Cloudflare Pages:** [CLOUDFLARE_PAGES_DEPLOYMENT.md](./CLOUDFLARE_PAGES_DEPLOYMENT.md)
- **Sistema completo:** [README_FINAL.md](./README_FINAL.md)
- **Implementação Odoo:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## ✨ Dicas

1. **Sempre teste localmente antes de fazer push:**
   ```bash
   npm run dev      # Servidor local
   npm run build    # Testar build
   ```

2. **Veja os logs de deploy:**
   - Cloudflare: https://dash.cloudflare.com → Pages → Deployments
   - Supabase: https://supabase.com/dashboard → Functions → Logs

3. **Use branches para testar:**
   ```bash
   git checkout -b teste-nova-feature
   # ... faça mudanças ...
   git push origin teste-nova-feature
   # Cloudflare cria preview automático!
   ```

---

**Mantido por:** Logic View Bright Team  
**Última atualização:** 03/02/2026
