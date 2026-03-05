#!/bin/bash

# Script para corrigir projetos duplicados na Vercel
# Mantém apenas logic-view-bright-main (com variáveis)
# Remove logic-view-bright (vazio)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Fix Vercel Duplicate Projects                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está autenticado
if ! vercel whoami &>/dev/null; then
    echo -e "${RED}❌ Não autenticado na Vercel${NC}"
    echo -e "${YELLOW}Execute: vercel login${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Situação atual:${NC}"
echo -e "   ✅ ${GREEN}logic-view-bright-main${NC} - CORRETO (com variáveis)"
echo -e "      https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main"
echo ""
echo -e "   ❌ ${RED}logic-view-bright${NC} - DUPLICADO (vazio)"
echo -e "      https://vercel.com/logiccamila-wqs-projects/logic-view-bright"
echo ""

# Verificar link atual
if [ -f ".vercel/project.json" ]; then
    CURRENT_PROJECT=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
    echo -e "${YELLOW}🔗 Link atual:${NC} $CURRENT_PROJECT"
    echo ""
fi

# Passo 1: Desvincular projeto atual
echo -e "${BLUE}[1/4]${NC} Desvinculando projeto duplicado..."
if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo -e "   ${GREEN}✓${NC} Removido link local"
fi

# Passo 2: Vincular ao projeto correto
echo -e "${BLUE}[2/4]${NC} Vinculando ao projeto correto (logic-view-bright-main)..."
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   1. Quando perguntar 'Set up and deploy', escolha: ${GREEN}N${NC} (No)"
echo -e "   2. Quando perguntar 'Link to existing project?', escolha: ${GREEN}Y${NC} (Yes)"
echo -e "   3. Quando perguntar qual projeto, escolha: ${GREEN}logic-view-bright-main${NC}"
echo -e "   4. Team: ${GREEN}logiccamila-wqs-projects${NC}"
echo ""
read -p "Pressione ENTER para continuar..."

vercel link

# Verificar se vinculou corretamente
if [ -f ".vercel/project.json" ]; then
    NEW_PROJECT=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
    if [ "$NEW_PROJECT" = "logic-view-bright-main" ]; then
        echo -e "${GREEN}✓ Vinculado corretamente a: $NEW_PROJECT${NC}"
    else
        echo -e "${RED}❌ ERRO: Vinculado a projeto errado: $NEW_PROJECT${NC}"
        exit 1
    fi
fi

# Passo 3: Instruções para remover projeto duplicado
echo ""
echo -e "${BLUE}[3/4]${NC} Como remover o projeto duplicado:"
echo -e "${YELLOW}⚠️  NÃO pode ser feito via CLI, faça manualmente:${NC}"
echo ""
echo -e "   1. Acesse: ${GREEN}https://vercel.com/logiccamila-wqs-projects/logic-view-bright/settings${NC}"
echo -e "   2. Role até o final da página"
echo -e "   3. Clique em ${RED}'Delete Project'${NC}"
echo -e "   4. Confirme digitando o nome: ${YELLOW}logic-view-bright${NC}"
echo ""
read -p "Pressione ENTER após deletar o projeto duplicado..."

# Passo 4: Fazer deploy no projeto correto
echo ""
echo -e "${BLUE}[4/4]${NC} Fazendo deploy no projeto correto..."
echo ""

if vercel deploy --prod --yes; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            ✓ PROBLEMA RESOLVIDO!               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Projeto único:${NC} logic-view-bright-main"
    echo -e "${GREEN}✅ Deploy realizado com sucesso${NC}"
    echo ""
    echo -e "${BLUE}📊 Verificar:${NC}"
    echo -e "   Projeto:    https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main"
    echo -e "   Domínios:   https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main/settings/domains"
    echo -e "   Variáveis:  https://vercel.com/logiccamila-wqs-projects/logic-view-bright-main/settings/environment-variables"
    echo -e "   Deploy:     https://logic-view-bright-main.vercel.app"
    echo ""
else
    echo -e "${RED}❌ Erro no deploy${NC}"
    exit 1
fi

# Verificação final
echo -e "${BLUE}🔍 Verificação final:${NC}"
vercel ls logic-view-bright-main 2>/dev/null && echo -e "${GREEN}✓ Projeto principal encontrado${NC}" || echo -e "${RED}❌ Projeto não encontrado${NC}"

echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "   1. Configure DNS do domínio personalizado (se tiver)"
echo -e "   2. Verifique as variáveis de ambiente estão todas presentes"
echo -e "   3. Teste o site: https://logic-view-bright-main.vercel.app"
echo ""
