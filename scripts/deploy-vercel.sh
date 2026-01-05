#!/bin/bash
# Deploy Rápido para Vercel
# Uso: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Deploy Rápido - Logic View Bright → Vercel"
echo "=============================================="
echo ""

# 1. Build
echo "📦 Construindo projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build concluído"
echo ""

# 2. Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI não encontrado. Instalando..."
    npm install -g vercel@latest
fi

echo ""
echo "📤 Fazendo deploy para produção..."
echo ""

# 3. Deploy
vercel --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Aguarde 2-5 minutos para propagação"
echo "  2. Execute: ./scripts/check-dns.sh"
echo "  3. Teste: https://xyzlogicflow.tech"
echo ""
