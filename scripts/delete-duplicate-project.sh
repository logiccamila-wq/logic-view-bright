#!/bin/bash

# Abrir página de configurações do projeto duplicado para deletar
echo "🌐 Abrindo página para deletar projeto duplicado..."
echo ""
echo "🔴 DELETAR: logic-view-bright (vazio)"
echo "✅ MANTER: logic-view-bright-main (com variáveis)"
echo ""

# Abrir no navegador padrão
"$BROWSER" "https://vercel.com/logiccamila-wqs-projects/logic-view-bright/settings" &

sleep 2

echo ""
echo "📋 PASSOS PARA DELETAR:"
echo "   1. Role até o final da página"
echo "   2. Seção 'Delete Project'"
echo "   3. Clique no botão vermelho 'Delete'"
echo "   4. Digite: logic-view-bright"
echo "   5. Confirme"
echo ""
echo "✅ Após deletar, você terá apenas 1 projeto: logic-view-bright-main"
echo ""
