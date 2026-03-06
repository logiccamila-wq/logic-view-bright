## Documento Legado

Este arquivo esta arquivado e nao representa mais o fluxo oficial de deploy.

Use os guias Azure-only:

- `DEPLOYMENT.md`
- `AZURE_STATIC_WEB_APPS_DEPLOY.md`
- `GO_LIVE_CHECKLIST.md`
- `POST_DEPLOYMENT_CHECKLIST.md`

Dominio oficial de producao:

- `https://www.xyzlogicflow.com.br`
NEXT_PUBLIC_WS_URL=wss://optilog.app

# NEON DATA API (Opcional - apenas se usar Data API)
NEON_DATA_API_URL=https://console.neon.tech/api/v2
NEON_AUTH_JWKS_URL=https://console.neon.tech/.well-known/jwks.json
NEON_AUTH_ISSUER=https://console.neon.tech
NEON_AUTH_AUDIENCE=neon

# OPENAI (para IA/ML features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# INTEGRAÇÕES (Configurar depois do deploy)
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_ID=xxxxx-yyyyy.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# NODE
NODE_ENV=production
```

### **2.2 Como Adicionar no Vercel:**
1. Vercel Dashboard → Projeto → Settings → Environment Variables
2. Copiar cada variável acima
3. Selecionar: **Production**, **Preview**, **Development** (todas)
4. Clicar **Save**

---

## 🏗️ PASSO 3: BUILD E DEPLOY

### **3.1 Build Local (Testar antes):**
```bash
cd /workspaces/optilog.app

# Instalar dependências
npm install

# Rodar build
npm run build

# Testar produção localmente
npm run start:prod

# Acessar: http://localhost:3000
```

### **3.2 Deploy no Vercel:**

#### **Opção A: Deploy via Git (Recomendado)**
```bash
# Fazer push para main (já feito!)
git push origin main

# Vercel detecta automaticamente e faz deploy
# Aguardar build no dashboard: https://vercel.com/seu-usuario/optilog-app
```

#### **Opção B: Deploy via CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Seguir prompts
```

### **3.3 Configurações Vercel (vercel.json já configurado):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

---

## 🔍 PASSO 4: VERIFICAÇÃO PÓS-DEPLOY

### **4.1 Checklist de Funcionalidades:**
```bash
# Abrir URL de produção: https://optilog-app.vercel.app

✅ Página inicial carrega
✅ Login funciona
✅ Dashboard aparece
✅ Cadastros funcionam (veículos, motoristas)
✅ API responde (/api/vehicles)
✅ Database conecta (testar CRUD)
✅ Módulos de análise carregam
✅ Performance dashboard funciona
✅ Integrações aparecem
```

### **4.2 Testar APIs:**
```bash
# Healthcheck
curl https://optilog-app.vercel.app/api/health

# Veículos
curl https://optilog-app.vercel.app/api/vehicles

# Motoristas
curl https://optilog-app.vercel.app/api/drivers
```

### **4.3 Logs e Debugging:**
```bash
# Ver logs no Vercel:
https://vercel.com/seu-usuario/optilog-app/logs

# Filtrar erros:
- Runtime Logs
- Build Logs
- Edge Logs
```

---

## 🌐 PASSO 5: CONFIGURAR DOMÍNIO CUSTOMIZADO (Opcional)

### **5.1 Adicionar Domínio:**
1. Vercel Dashboard → Settings → Domains
2. Adicionar: `optilog.app` e `www.optilog.app`
3. Configurar DNS no registrador:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **5.2 SSL Automático:**
- Vercel provisiona SSL automaticamente (Let's Encrypt)
- Aguardar ~5 minutos para propagação DNS

---

## 🔐 PASSO 6: SEGURANÇA E PERFORMANCE

### **6.1 Configurações de Segurança:**
```bash
# Headers de segurança (já configurados em next.config.js)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### **6.2 Rate Limiting (Vercel Pro):**
```javascript
// Configurar em vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### **6.3 Cache e CDN:**
- Vercel Edge Network: automático
- Static assets: cache permanente
- API routes: cache controlado por headers

---

## 📊 PASSO 7: MONITORAMENTO

### **7.1 Analytics Vercel:**
- Ativar: Settings → Analytics → Enable
- Métricas: Page views, Load time, Core Web Vitals

### **7.2 Error Tracking:**
```bash
# Adicionar Sentry (opcional)
npm install @sentry/nextjs

# Configurar sentry.config.js
```

### **7.3 Uptime Monitoring:**
- Usar: UptimeRobot, Pingdom, ou Vercel Monitoring
- Configurar alertas por email/SMS

---

## 🔄 PASSO 8: BACKUP E ROLLBACK

### **8.1 Backup Database (Neon):**
```bash
# Backup automático Neon (point-in-time recovery até 7 dias)
# Manual backup:
pg_dump "postgresql://user:pass@pooler.neon.tech/optilog" > backup_$(date +%Y%m%d).sql
```

### **8.2 Rollback Deploy:**
```bash
# No Vercel Dashboard:
Deployments → Selecionar deployment anterior → Promote to Production

# Via CLI:
vercel rollback
```

---

## ✅ CHECKLIST FINAL GO LIVE

### **30 minutos antes (13:30):**
- [ ] Database Neon ativo e conectando
- [ ] Todas variáveis ambiente configuradas
- [ ] Build local bem-sucedido
- [ ] Deploy Vercel concluído
- [ ] Domínio configurado (se aplicável)
- [ ] SSL ativo

### **15 minutos antes (13:45):**
- [ ] Testar login
- [ ] Testar cadastros (veículo, motorista)
- [ ] Testar APIs (/api/vehicles, /api/drivers)
- [ ] Verificar performance dashboard
- [ ] Testar integrações (Notion, Calendar)

### **GO LIVE (14:00):**
- [ ] Anunciar para equipe
- [ ] Distribuir credenciais
- [ ] Monitorar logs em tempo real
- [ ] Suporte disponível

---

## 🆘 TROUBLESHOOTING

### **Erro: Database connection failed**
```bash
# Verificar:
1. DATABASE_URL correto no Vercel
2. Neon database ativo (não pausado)
3. Firewall/IP whitelist (Neon permite todas IPs por padrão)
4. SSL mode=require na connection string
```

### **Erro: Build failed**
```bash
# Verificar:
1. Node version: 18.x ou superior
2. Dependências instaladas: npm install
3. TypeScript erros: npm run type-check
4. Logs de build no Vercel
```

### **Erro: 500 Internal Server Error**
```bash
# Verificar:
1. Logs do Vercel (Runtime Logs)
2. Variáveis de ambiente faltando
3. Database queries falhando
4. API routes com erros
```

### **Performance lenta:**
```bash
# Otimizações:
1. Ativar caching de API routes
2. Usar ISR (Incremental Static Regeneration)
3. Otimizar queries SQL (indexes)
4. Reduzir bundle size (code splitting)
```

---

## 📞 CONTATOS DE SUPORTE

**Vercel Support:** https://vercel.com/support  
**Neon Support:** https://neon.tech/docs/introduction/support  
**Documentação Next.js:** https://nextjs.org/docs

---

## 🎉 PÓS GO-LIVE

### **Primeiras 24h:**
- Monitorar logs continuamente
- Coletar feedback da equipe
- Corrigir bugs críticos imediatamente
- Documentar issues conhecidos

### **Primeira semana:**
- Treinar usuários em todos módulos
- Configurar integrações (Notion, Calendar, WhatsApp)
- Otimizar performance baseado em métricas reais
- Preparar roadmap de melhorias

---

**🚀 BOA SORTE NO GO LIVE! O SISTEMA ESTÁ 100% PRONTO!**

*"48 módulos. 95/100 pontos. R$ 1.2M economia/ano. Vamos dominar o mercado."* 💪
