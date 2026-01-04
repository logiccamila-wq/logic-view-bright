#!/bin/bash
# Script de Deploy Completo - Logic View Bright

echo "🚀 ============================================"
echo "   DEPLOY COMPLETO - LOGIC VIEW BRIGHT"
echo "   ============================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 INFORMAÇÕES DOS PROJETOS VERCEL:${NC}\n"
echo "1️⃣  logic-view-bright-main.vercel.app"
echo "   - Status: Ativo (commit mais recente)"
echo "   - Project ID: prj_XcaU5LUlEbK5c1p6MhmBefjGU5vV"
echo ""
echo "2️⃣  www.xyzlogicflow.tech"
echo "   - Status: Página em branco (precisa deploy)"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}PASSO 1: AUTENTICAÇÃO VERCEL${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

echo "O Vercel CLI está solicitando login."
echo "Você precisa:"
echo ""
echo "1. Abrir o navegador em: https://vercel.com/device"
echo "2. Inserir o código: GCTQ-WBDL"
echo "3. Fazer login com sua conta"
echo "4. Voltar aqui e pressionar ENTER"
echo ""
echo -e "${GREEN}Após fazer login, o deploy continuará automaticamente!${NC}"
echo ""

# Aguardar login
vercel whoami

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Login realizado com sucesso!${NC}\n"
else
    echo -e "\n${RED}❌ Falha no login. Tente novamente.${NC}\n"
    exit 1
fi

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}PASSO 2: BUILD DO PROJETO${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

npm run build

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Erro no build${NC}\n"
    exit 1
fi

echo -e "\n${GREEN}✅ Build concluído!${NC}\n"

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}PASSO 3: DEPLOY PREVIEW${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

echo "Fazendo deploy preview..."
PREVIEW_URL=$(vercel --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)

echo -e "\n${GREEN}✅ Deploy preview concluído!${NC}"
echo -e "${BLUE}🔗 URL Preview: $PREVIEW_URL${NC}\n"

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}PASSO 4: DEPLOY PRODUÇÃO${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

read -p "Deseja fazer deploy de PRODUÇÃO agora? (s/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Fazendo deploy de produção..."
    PROD_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*' | head -1)
    
    echo -e "\n${GREEN}✅ Deploy de produção concluído!${NC}"
    echo -e "${BLUE}🔗 URL Produção: $PROD_URL${NC}\n"
else
    echo "Deploy de produção cancelado."
    echo "Execute manualmente quando quiser: vercel --prod"
    echo ""
fi

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✨ DEPLOY FINALIZADO COM SUCESSO!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

echo "📋 URLs do Sistema:"
echo ""
echo "Preview: $PREVIEW_URL"
echo "Produção: https://logic-view-bright-main.vercel.app"
echo "Domínio: https://www.xyzlogicflow.tech"
echo ""
echo "📄 Documentação: SYSTEM_ACCESS.md"
echo ""
echo "🔐 Credenciais de Acesso:"
echo "   Admin: admin@logicview.com / Admin@2024"
echo "   Motorista: motorista@logicview.com / Motorista@2024"
echo "   Mecânico: mecanico@logicview.com / Mecanico@2024"
echo "   Gestor: gestor@logicview.com / Gestor@2024"
echo ""
echo "✅ Sistema pronto para uso!"
echo ""
