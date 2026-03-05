# 🎯 SOLUÇÃO RÁPIDA - Tela em Branco na Vercel

## O QUE ACONTECEU?

✅ **Local funciona** → https://organic-space-sniffle-wrj6wpw7wqw4c5xr-5173.app.github.dev/  
❌ **Vercel em branco** → https://logic-view-bright-main.vercel.app/  
❌ **Domínio em branco** → https://www.xyzlogicflow.tech/

**CAUSA:** Faltam variáveis de ambiente VITE_SUPABASE na Vercel

---

## ⚡ SOLUÇÃO EM 3 PASSOS

### PASSO 1: Pegar Credenciais do Supabase

#### Opção A: Via Dashboard
1. Abra: https://supabase.com/dashboard
2. Faça login
3. Clique no seu projeto
4. Menu lateral: **Settings** → **API**
5. Copie e guarde:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
   ```

#### Opção B: Se você já usou antes
- Execute no terminal: `./find-supabase-keys.sh`
- Ou procure em arquivos `.env.local` antigos

---

### PASSO 2: Configurar na Vercel

1. **Abra:** https://vercel.com/dashboard
2. **Clique** no projeto `logic-view-bright-main`
3. **Menu superior:** Settings
4. **Menu lateral:** Environment Variables
5. **Clique:** "Add New"

**Adicione estas 2 variáveis:**

```
Name: VITE_SUPABASE_URL
Value: https://xxxxx.supabase.co  ← Cole a URL que você copiou
Environment: Production, Preview, Development (marque todas)
```

```
Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx  ← Cole a chave
Environment: Production, Preview, Development (marque todas)
```

6. **Clique:** Save

---

### PASSO 3: Fazer Redeploy

**Opção A - Via Git (Recomendado):**
```bash
git commit --allow-empty -m "trigger: redeploy com env vars"
git push origin main
```

**Opção B - Via Dashboard:**
1. Na Vercel, vá em **Deployments**
2. Clique nos **3 pontinhos** (`...`) do último deploy
3. Clique em **Redeploy**
4. Confirme

---

## ⏱️ Aguarde 1-2 Minutos

Após o redeploy, teste:
- https://logic-view-bright-main.vercel.app/
- https://www.xyzlogicflow.tech/

**✅ Deve carregar normalmente!**

---

## 🆘 Se Ainda Não Funcionar

1. **Abra o site**
2. **Aperte F12** (Developer Tools)
3. **Vá na aba Console**
4. **Tire print dos erros em vermelho**
5. **Me mostre os erros**

---

## 📝 Checklist

- [ ] Peguei as credenciais do Supabase
- [ ] Adicionei VITE_SUPABASE_URL na Vercel
- [ ] Adicionei VITE_SUPABASE_ANON_KEY na Vercel
- [ ] Salvei as variáveis
- [ ] Fiz redeploy (git push ou manual)
- [ ] Aguardei 2 minutos
- [ ] Testei o site

---

## 🎯 RESUMO VISUAL

```
┌─────────────────────────────────────────┐
│ 1. Supabase Dashboard                   │
│    → Settings → API                     │
│    → Copiar URL e anon key              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Vercel Dashboard                     │
│    → logic-view-bright-main             │
│    → Settings → Env Variables           │
│    → Adicionar VITE_SUPABASE_*          │
│    → Save                                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Redeploy                             │
│    → git push OU manual                 │
│    → Aguardar 2 min                     │
└──────────────┬──────────────────────────┘
               │
               ▼
         ✅ SITE FUNCIONANDO!
```

---

**Execute agora e me avise quando tiver configurado as variáveis!**
