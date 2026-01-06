#!/bin/bash

# Script para verificar e guiar configuração de variáveis de ambiente no Vercel

echo ""
echo "🔍 Verificando configuração do projeto..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis esperadas
EXPECTED_URL="https://eixkvksttadhukucohda.supabase.co"
EXPECTED_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeGt2a3N0dGFkaHVrdWNvaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzE0MzEsImV4cCI6MjA1MTE0NzQzMX0.WR1J2Af_gSLHVp_PXi-yTkewB2bz_vXpvS9waDObTYA"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GUIA: Configurar Variáveis de Ambiente no Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}📋 PASSO A PASSO:${NC}"
echo ""

echo "1. Abra o Vercel Dashboard:"
echo -e "   ${GREEN}https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables${NC}"
echo ""

echo "2. Clique em 'Add New' e adicione a primeira variável:"
echo ""
echo "   Nome da Variável:"
echo -e "   ${GREEN}VITE_SUPABASE_URL${NC}"
echo ""
echo "   Valor (copie exatamente):"
echo -e "   ${GREEN}${EXPECTED_URL}${NC}"
echo ""
echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
echo ""
echo "   Clique em 'Save'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "3. Clique em 'Add New' novamente para a segunda variável:"
echo ""
echo "   Nome da Variável:"
echo -e "   ${GREEN}VITE_SUPABASE_PUBLISHABLE_KEY${NC}"
echo ""
echo "   Valor (copie exatamente):"
echo -e "   ${GREEN}${EXPECTED_KEY}${NC}"
echo ""
echo "   Environments: ✅ Production  ✅ Preview  ✅ Development"
echo ""
echo "   Clique em 'Save'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "4. Force Redeploy:"
echo -e "   a) Vá em: ${GREEN}https://vercel.com/logiccamila-wq/logic-view-bright/deployments${NC}"
echo "   b) Clique nos 3 pontinhos (...) do último deployment"
echo "   c) Clique em 'Redeploy'"
echo "   d) Confirme clicando em 'Redeploy' novamente"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "5. Aguarde 2-3 minutos e teste:"
echo -e "   ${GREEN}https://logic-view-bright.vercel.app${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${YELLOW}💡 DICA:${NC}"
echo "   Use Ctrl+C (Windows/Linux) ou Cmd+C (Mac) para copiar os valores acima"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Copie os valores EXATAMENTE como mostrado (sem espaços extras)"
echo "   - Marque TODAS as 3 checkboxes (Production, Preview, Development)"
echo "   - Faça redeploy após adicionar as variáveis"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Pressione ENTER para copiar VITE_SUPABASE_URL para clipboard..."
echo "$EXPECTED_URL" | xclip -selection clipboard 2>/dev/null || echo "$EXPECTED_URL" | pbcopy 2>/dev/null || echo "⚠️  Auto-copy não disponível. Copie manualmente: $EXPECTED_URL"

echo ""
read -p "Pressione ENTER para copiar VITE_SUPABASE_PUBLISHABLE_KEY para clipboard..."
echo "$EXPECTED_KEY" | xclip -selection clipboard 2>/dev/null || echo "$EXPECTED_KEY" | pbcopy 2>/dev/null || echo "⚠️  Auto-copy não disponível. Copie manualmente: $EXPECTED_KEY"

echo ""
echo -e "${GREEN}✅ Siga os passos acima para configurar as variáveis!${NC}"
echo ""
