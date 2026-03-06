
# Plano: Rebuild e Redeploy Azure SWA

## Status Atual
- ✅ Landing page corrigida (gradientes, partículas, botões)
- ✅ Deploy anterior funcionou via SWA CLI
- 🔄 Rebuild e redeploy pendente

## Passos

### 1. Build de Produção
```bash
cd /workspaces/logic-view-bright
./node_modules/.bin/vite build --outDir dist
```
- Verificar que `dist/index.html` foi gerado
- Conferir tamanho do bundle

### 2. Deploy via SWA CLI
```bash
swa deploy ./dist \
  --api-location ./api \
  --api-language "node" \
  --api-version "20" \
  --app-name "Devoptlog" \
  --subscription-id "6751146c-d6a5-4569-9c99-22e566364b11" \
  --resource-group "Devoptlog_group" \
  --env production \
  --no-use-keychain
```
- Requer device code auth (2x: login + setup)
- URL final: https://ambitious-ground-0c8824f0f.1.azurestaticapps.net

### 3. Validação Pós-Deploy
- `curl` na URL para confirmar HTML do React (não página padrão Azure)
- Verificar que landing page renderiza sem distorções
- Testar navegação para `/login`

### 4. Git Commit
```bash
git add -A && git commit -m "fix: corrigir layout landing page" && git push origin main
```

## Notas
- CI/CD via GitHub Actions **desabilitado** por decisão do usuário
- Deploy manual via `swa deploy` CLI
- Fonte no Azure configurada como "Token" (não GitHub)
