# ⚠️ RESOLVER PROJETOS DUPLICADOS VERCEL - AÇÃO IMEDIATA

## 🔴 Problema Identificado

Você tem **2 projetos Vercel** para o mesmo código:

### ✅ CORRETO (Manter)
- **Nome:** `logic-view-bright-main`
- **Status:** ✓ Tem todas as variáveis de ambiente
- **URL:** https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main
- **Deploy:** https://logic-view-bright-main.vercel.app

### ❌ DUPLICADO (Deletar)
- **Nome:** `logic-view-bright`
- **Status:** ✗ Vazio, sem variáveis
- **URL:** https://vercel.com/logiccamila-wqs-projects/logic-view-bright
- **Ação:** DELETAR

---

## 🚀 SOLUÇÃO RÁPIDA (2 minutos)

### Opção 1: Script Automático (Recomendado)

```bash
./scripts/fix-vercel-duplicate.sh
```

O script vai:
1. ✅ Desvincular o projeto duplicado
2. ✅ Vincular ao projeto correto (`logic-view-bright-main`)
3. ⚠️ Te guiar para deletar manualmente o projeto vazio
4. ✅ Fazer deploy no projeto correto

---

### Opção 2: Manual (5 minutos)

#### Passo 1: Desvincular projeto local
```bash
rm -rf .vercel
```

#### Passo 2: Vincular ao projeto correto
```bash
vercel link
```

**Respostas:**
- Set up and deploy? → **N** (No)
- Link to existing project? → **Y** (Yes)
- Team: → **logiccamila-wqs-projects**
- Project: → **logic-view-bright-main**

#### Passo 3: Deletar projeto duplicado
1. Acesse: https://vercel.com/logiccamila-wqs-projects/logic-view-bright/settings
2. Role até o final: **"Delete Project"**
3. Confirme digitando: `logic-view-bright`
4. Clique: **Delete**

#### Passo 4: Deploy no projeto correto
```bash
vercel deploy --prod
```

---

## ✅ Verificação

Após executar, verifique:

```bash
# Ver projeto vinculado localmente
cat .vercel/project.json

# Deve mostrar: "projectName":"logic-view-bright-main"
```

**Links para verificar:**
- ✅ Projeto: https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main
- ✅ Variáveis: https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main/settings/environment-variables
- ✅ Deploy: https://logic-view-bright-main.vercel.app
- ❌ Projeto vazio (deve dar erro 404): https://vercel.com/logiccamila-wqs-projects/logic-view-bright

---

## 🔍 Por que isso aconteceu?

O arquivo `.vercel/project.json` estava vinculado ao projeto **errado**:

```json
{
  "projectId": "prj_M0upwxP4YO8UxXrZVX4aJ90Zcbx1",
  "projectName": "logic-view-bright"  ← ERRADO
}
```

Deveria ser:
```json
{
  "projectName": "logic-view-bright-main"  ← CORRETO
}
```

---

## 📋 Checklist Final

- [ ] Executado `./scripts/fix-vercel-duplicate.sh` OU manual
- [ ] Projeto duplicado deletado da Vercel
- [ ] `.vercel/project.json` aponta para `logic-view-bright-main`
- [ ] Deploy realizado com sucesso
- [ ] Site funcionando: https://logic-view-bright-main.vercel.app
- [ ] Variáveis de ambiente presentes no projeto

---

## 🆘 Problemas?

### Erro: "Project not found"
```bash
vercel link
# Escolha logic-view-bright-main
```

### Erro: "Authentication required"
```bash
vercel login
```

### Projeto duplicado não aparece para deletar
- Talvez já tenha sido deletado
- Verifique: https://vercel.com/logiccamila-wqs-projects

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs: `cat .vercel/project.json`
2. Liste projetos: `vercel ls`
3. Status: `./scripts/status-vercel.sh`
