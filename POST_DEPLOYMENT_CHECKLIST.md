# Post-Deployment Checklist (Azure-only)

## 1. Frontend e Domínio
- [ ] Site acessível em `https://www.xyzlogicflow.com.br`
- [ ] HTTPS válido e sem warnings de certificado
- [ ] Rotas SPA funcionando (refresh direto sem 404)

## 2. Runtime API
- [ ] `GET /api/runtime/auth/session` responde 200
- [ ] `POST /api/runtime/query` responde 200 para consulta simples
- [ ] `POST /api/runtime/mutate` responde 200 em operação de teste
- [ ] Logs sem erro crítico no Azure Functions

## 3. Auth e Segurança
- [ ] Login funcional na página inicial
- [ ] Logout funcional
- [ ] `ALLOWED_ORIGINS` inclui `https://www.xyzlogicflow.com.br`
- [ ] `AZURE_JWT_SECRET` configurado e forte

## 4. Marketplace e Módulos
- [ ] Botão de acesso ao Marketplace na landing
- [ ] Catálogo com mais de 50 módulos ativos
- [ ] Navegação para módulos críticos sem erro de rota

## 5. Observabilidade
- [ ] App Insights habilitado
- [ ] Alertas de 5xx e latência configurados
- [ ] Logs de deploy versionados no GitHub Actions

## 6. Rollback
- [ ] Último deploy estável identificado
- [ ] Procedimento de rollback validado no SWA
