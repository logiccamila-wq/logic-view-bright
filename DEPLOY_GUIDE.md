# 🚀 GUIA RÁPIDO DE DEPLOY

## Status Atual

✅ **Projeto Vinculado:** logic-view-bright (Project ID: prj_XcaU5LUlEbK5c1p6MhmBefjGU5vV)  
✅ **Vercel CLI:** Instalado  
⚠️  **Autenticação:** Necessária

---

## 📋 Passo a Passo para Deploy

### 1️⃣ Autenticar no Vercel

```bash
vercel login
```

**OU** acesse: https://vercel.com/device e use o código: **GCTQ-WBDL**

### 2️⃣ Executar Deploy Automático

```bash
./scripts/deploy-complete.sh
```

**OU** manualmente:

```bash
# Build
npm run build

# Deploy preview
vercel

# Deploy produção
vercel --prod
```

---

## 🌐 URLs dos Projetos

### Logic View Bright Main (Recomendado)
- **URL:** https://logic-view-bright-main.vercel.app
- **Status:** ✅ Ativo (commit mais recente)
- **Uso:** Desenvolvimento e Staging

### XYZ Logic Flow (Produção)
- **URL:** https://www.xyzlogicflow.tech
- **Status:** ⚠️ Página em branco (precisa deploy)
- **Uso:** Produção com domínio customizado

---

## 🔐 Credenciais de Teste

| Perfil | Email | Senha | URL |
|--------|-------|-------|-----|
| **Admin** | admin@logicview.com | Admin@2024 | /dashboard |
| **Motorista** | motorista@logicview.com | Motorista@2024 | /driver-app |
| **Mecânico** | mecanico@logicview.com | Mecanico@2024 | /mechanic-app |
| **Gestor** | gestor@logicview.com | Gestor@2024 | /dashboard |

---

## 🛠️ Comandos Úteis

```bash
# Ver status do deploy
vercel ls

# Ver logs em tempo real
vercel logs --follow

# Remover deploy antigo
vercel rm [deployment-url]

# Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL

# Verificar projeto vinculado
cat .vercel/project.json
```

---

## 🔧 Problemas Comuns

### Página em Branco (500/502)
```bash
# 1. Verificar build
npm run build

# 2. Verificar variáveis de ambiente
vercel env ls

# 3. Verificar logs
vercel logs
```

### Erro de Autenticação
```bash
# Fazer logout e login novamente
vercel logout
vercel login
```

### Deploy não atualiza
```bash
# Limpar cache e rebuild
rm -rf .vercel dist node_modules
npm install
npm run build
vercel --prod --force
```

---

## ✅ Checklist Pós-Deploy

- [ ] Build concluído sem erros
- [ ] Deploy preview funcionando
- [ ] Deploy produção funcionando
- [ ] Todos os perfis testados (Admin, Motorista, Mecânico, Gestor)
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio customizado configurado (se aplicável)
- [ ] SSL/HTTPS ativo
- [ ] Logs monitorados

---

## 📞 Links Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Repo:** https://github.com/logiccamila-wq/logic-view-bright
- **Documentação Completa:** [SYSTEM_ACCESS.md](SYSTEM_ACCESS.md)

---

**🎉 Após o deploy, acesse:**
- https://logic-view-bright-main.vercel.app
- https://www.xyzlogicflow.tech

**Use as credenciais acima para testar!**
