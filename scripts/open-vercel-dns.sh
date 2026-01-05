#!/bin/bash
# Abre o dashboard da Vercel para configurar o DNS do domínio

echo "🌐 Abrindo dashboard da Vercel para configurar DNS..."
echo ""
echo "📋 O que você precisa fazer:"
echo "   1. Verificar se xyzlogicflow.tech está listado"
echo "   2. Adicionar registros DNS (A e CNAME)"
echo "   3. Aguardar 5-10 minutos"
echo ""
echo "📚 Guia completo: RESOLVER_DNS_AGORA.md"
echo ""

# URL do dashboard
URL="https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main/settings/domains"

# Tentar abrir no navegador
if command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
elif command -v open &> /dev/null; then
    open "$URL"
elif [[ -n "$BROWSER" ]]; then
    "$BROWSER" "$URL"
else
    echo "🔗 Abra manualmente:"
    echo "   $URL"
fi

echo ""
echo "✅ Após configurar, execute: ./scripts/check-dns.sh"
