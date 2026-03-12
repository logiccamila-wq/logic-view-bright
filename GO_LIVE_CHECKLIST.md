# Go-Live Checklist Azure (www.xyzlogicflow.com.br)

## 1. Escopo
- Frontend: Azure Static Web Apps
- API: Azure Functions (`/api/runtime/*`)
- Banco: Azure Database for PostgreSQL
- IA: Azure OpenAI
- Domínio principal: `www.xyzlogicflow.com.br`

## 2. Pré-Go-Live
- [x] Domínio `xyzlogicflow.com.br` ativo (validade: 2027-02-23, renovação automática)
- [x] DNS apontando para Azure DNS:
  - `ns1-07.azure-dns.com`
  - `ns2-07.azure-dns.net`
  - `ns3-07.azure-dns.org`
  - `ns4-07.azure-dns.info`
- [ ] Certificado TLS ativo e renovação automática habilitada
- [ ] Variáveis em SWA configuradas:
- [ ] `VITE_APP_URL=https://www.xyzlogicflow.com.br`
- [ ] `VITE_API_BASE_URL=/api`
- [ ] Variáveis no backend configuradas:
- [ ] `AZURE_POSTGRES_*` ou `DATABASE_URL`
- [ ] `AZURE_JWT_SECRET` e `AZURE_JWT_EXPIRES_IN`
- [ ] `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`
- [ ] `ALLOWED_ORIGINS=https://www.xyzlogicflow.com.br`

## 3. Build e Release
- [ ] `npm ci` sem erro
- [ ] `npm run build:azure` sem erro
- [ ] Workflow `.github/workflows/azure-deploy.yml` com sucesso
- [ ] `api_location: "api"` confirmado

## 4. Smoke Test Funcional
- [ ] Página inicial abre em `https://www.xyzlogicflow.com.br`
- [ ] Botões `Login` e `Marketplace` funcionam
- [ ] Login com usuário válido funciona
- [ ] Logout funciona
- [ ] Acesso ao marketplace funciona
- [ ] Catálogo mostra mais de 50 módulos
- [ ] Rotas críticas abrem:
- [ ] `/dashboard`
- [ ] `/drivers-management`
- [ ] `/approvals`
- [ ] `/logistics-kpi`
- [ ] `/bank-reconciliation`
- [ ] `/documents`

## 5. Smoke Test API
- [ ] `POST /api/runtime/auth/signin`
- [ ] `GET /api/runtime/auth/session`
- [ ] `POST /api/runtime/query`
- [ ] `POST /api/runtime/mutate`
- [ ] `POST /api/runtime/rpc`
- [ ] `POST /api/runtime/invoke/<function>` (quando usado)

## 6. Segurança e Operação
- [ ] Sem secrets no frontend (`VITE_*` apenas públicos)
- [ ] `AZURE_JWT_SECRET` forte e rotacionável
- [ ] Logs habilitados no Azure Monitor / App Insights
- [ ] Alertas para erro 5xx e latência alta
- [ ] Backup e retenção do banco configurados

## 7. Critérios de Aceite
- [ ] Build verde
- [ ] Sem erros críticos no console/browser
- [ ] Login + marketplace operacionais
- [ ] 50+ módulos ativos e navegáveis
- [ ] Domínio `www.xyzlogicflow.com.br` atendendo frontend e API

## 8. Rollback
- [ ] Reverter para último deploy estável no SWA
- [ ] Reverter variáveis críticas (se alteração de segredo)
- [ ] Validar novamente checklist dos itens 3 e 4
