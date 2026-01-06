# 🔴 URGENTE: Configurar Variáveis de Ambiente no Vercel

## ❌ Problema Identificado

As páginas estão carregando em branco porque **as variáveis de ambiente não estão configuradas** no Vercel.

---

## ✅ Solução Rápida (5 minutos)

### 1. Acesse o Vercel Dashboard

**Link direto:** <https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables>

### 2. Adicione as Variáveis de Ambiente

Clique em **"Add New"** e adicione **CADA UMA** destas variáveis:

#### Variável 1: VITE_SUPABASE_URL

```
Name: VITE_SUPABASE_URL
Value: https://eixkvksttadhukucohda.supabase.co
Environments: ✅ Production, ✅ Preview, ✅ Development
```

#### Variável 2: VITE_SUPABASE_PUBLISHABLE_KEY

```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzE0MzEsImV4cCI6MjA1MTE0NzQzMX0.WR1J2Af_gSLHVp_PXi-yTkewB2bz_vXpvS9waDObTYA
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**IMPORTANTE:** Marque todas as 3 checkboxes (Production, Preview, Development)!

### 3. Encontrar Suas Chaves (Se Necessário)

Se precisar das chaves corretas:

1. Acesse: <https://supabase.com/dashboard/project/eixkvkst/settings/api>
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Force Redeploy

Após adicionar as variáveis:

**Opção A - Via Dashboard:**
1. Vá em: <https://vercel.com/logiccamila-wq/logic-view-bright/deployments>
2. Clique nos 3 pontinhos (...) do último deployment
3. Clique em **"Redeploy"**
4. Clique em **"Redeploy"** novamente para confirmar

**Opção B - Via Terminal:**
```bash
cd /workspaces/logic-view-bright
git commit --allow-empty -m "Force redeploy with env vars"
git push origin main
```

### 5. Aguarde e Teste

- Aguarde 2-3 minutos para o deploy completar
- Acesse: <https://logic-view-bright.vercel.app>
- A página deve carregar normalmente agora! ✅

---

## 🔍 Como Verificar Se Está Funcionando

Após configurar, abra o console do navegador (F12) em <https://logic-view-bright.vercel.app>

**Se ainda houver erros:**
- ❌ Verá: `[Supabase] VITE_SUPABASE_URL inválida ou placeholder`
- ✅ Não deve ver nenhum erro de Supabase

---

## 📋 Checklist de Verificação

Antes de considerar finalizado, confirme:

- [ ] Adicionei `VITE_SUPABASE_URL` no Vercel
- [ ] Adicionei `VITE_SUPABASE_PUBLISHABLE_KEY` no Vercel
- [ ] Marquei as 3 checkboxes (Production, Preview, Development) em ambas
- [ ] Fiz redeploy do projeto
- [ ] Aguardei 2-3 minutos
- [ ] Testei <https://logic-view-bright.vercel.app>
- [ ] A página carrega normalmente ✅

---

## 🎯 Variáveis Corretas (Para Copiar e Colar)

### VITE_SUPABASE_URL
```
https://eixkvksttadhukucohda.supabase.co
```

### VITE_SUPABASE_PUBLISHABLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzE0MzEsImV4cCI6MjA1MTE0NzQzMX0.WR1J2Af_gSLHVp_PXi-yTkewB2bz_vXpvS9waDObTYA
```

---

## ⚡ Após Configurar

**O sistema estará 100% funcional em:**
- ✅ <https://logic-view-bright.vercel.app>
- ✅ <https://xyzlogicflow.tech>
- ✅ Todas as URLs do Vercel

---

**Última Atualização:** 06/01/2026  
**Prioridade:** 🔴 CRÍTICA - Sistema não funciona sem isto
