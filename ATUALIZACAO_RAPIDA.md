# ⚡ Atualização Rápida - Optilog.app

## 🚀 Como Atualizar Tudo de Uma Vez

### **Método 1: Script Automático (Recomendado)**

```powershell
.\update-full.ps1
```

**O que faz:**
1. ✅ Verifica alterações locais
2. ✅ Commita mudanças (se houver)
3. ✅ Faz push para GitHub
4. ✅ Atualiza banco de dados (opcional)
5. ✅ Abre Vercel + Site no navegador

---

### **Método 2: Manual**

```powershell
# 1. Commitar alterações
git add .
git commit -m "sua mensagem aqui"

# 2. Enviar para GitHub
git push

# 3. Atualizar banco (se configurado)
node backend/scripts/db_setup_full.mjs
```

---

## 🗄️ Banco de Dados (JÁ CONFIGURADO! ✅)

### **Status:**
✅ **Neon já configurado na Vercel** (logiccamila@gmail.com)
- Branch `main`: 31 MB (produção)
- Região: `sa-east-1` (São Paulo)
- Uso: 1.32h de 100h/mês (98.7h disponíveis)

### **Para Desenvolvimento Local:**

**Passo 1:** Copie o template:
```powershell
Copy-Item .env.local.template .env.local
```

**Passo 2:** Obtenha a connection string:
1. Acesse: https://console.neon.tech/app/projects
2. Projeto: `optilog-app` (logiccamila@gmail.com)
3. Branch: `main` → Connection Details
4. Copie `DATABASE_URL`

**Passo 3:** Cole no `.env.local`:
```bash
DATABASE_URL=postgresql://...sua-connection-string...
```

**Passo 4:** Teste a conexão:
```powershell
node backend/test-neon.mjs
```

**📘 Detalhes:** Ver `SETUP_DATABASE.md` ou `.env.local.template`

---

## 🌐 URLs Importantes

- **App Produção:** https://optilog-app.vercel.app
- **Vercel Dashboard:** https://vercel.com/logiccamila-wq/optilog-app
- **Repositório:** https://github.com/logiccamila-wq/optilog.app
- **Neon Console:** https://console.neon.tech

---

## 📊 Status dos Módulos

✅ **24/24 módulos implementados (100%)!**

Ver detalhes: `MODULOS_STATUS.md`

---

## 🆘 Problemas Comuns

### **Push rejeitado:**
```powershell
git pull --rebase
git push
```

### **Banco não conecta:**
```powershell
# Testar conexão
node backend/test-neon.mjs

# Recriar tabelas
node backend/scripts/db_setup_full.mjs
```

### **Deploy não atualiza:**
1. Vercel → Deployments → Redeploy
2. Ou: Force push com `git push --force-with-lease`

---

## 📝 Comandos Úteis

```powershell
# Ver status
git status

# Ver diferenças
git diff

# Ver últimos commits
git log --oneline -5

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Limpar cache node
rm -r node_modules
npm install

# Dev local
npm run dev
```

---

**Última atualização:** 26/10/2025  
**Commit:** be7af88  
**Status:** ✅ 100% Funcional
