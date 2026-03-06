#!/bin/bash
set -e

# Deploy script para Azure Static Web Apps via SWA CLI (token manual)
# Uso: ./scripts/deploy.sh
# Requer: npm install -g @azure/static-web-apps-cli

APP_NAME="Devoptlog"
SUBSCRIPTION_ID="6751146c-d6a5-4569-9c99-22e566364b11"
RESOURCE_GROUP="Devoptlog_group"
API_LANGUAGE="node"
API_VERSION="20"

echo "=== OptiLog Deploy ==="
echo "Build de produção..."
cd "$(dirname "$0")/.."

# Build
./node_modules/.bin/vite build --outDir dist

if [ ! -f dist/index.html ]; then
  echo "ERRO: Build falhou - dist/index.html não encontrado"
  exit 1
fi

echo "Build OK. Deployando para Azure..."

# Deploy via SWA CLI (login interativo com device code)
swa deploy ./dist \
  --api-location ./api \
  --api-language "$API_LANGUAGE" \
  --api-version "$API_VERSION" \
  --app-name "$APP_NAME" \
  --subscription-id "$SUBSCRIPTION_ID" \
  --resource-group "$RESOURCE_GROUP" \
  --env production \
  --no-use-keychain

echo "=== Deploy concluído ==="
echo "URL: https://ambitious-ground-0c8824f0f.1.azurestaticapps.net"
echo "Domínio: https://www.xyzlogicflow.com.br"
