#!/bin/bash
# Fix automático para configuração DNS do Vercel

set -e

echo "🔧 Corrigindo Configuração DNS - xyzlogicflow.tech"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Problema Detectado:${NC}"
echo "  - xyzlogicflow.tech: Configuração inválida"
echo "  - www.xyzlogicflow.tech: Verificação necessária"
echo ""
echo -e "${YELLOW}🎯 Solução:${NC}"
echo "  O Vercel precisa do registro A configurado manualmente"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Instalando Vercel CLI...${NC}"
    npm install -g vercel@latest
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  INSTRUÇÕES - Configure no Painel do Vercel${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Como você está usando Nameservers do Vercel, os registros DNS"
echo "devem ser gerenciados DIRETAMENTE no painel do Vercel."
echo ""
echo -e "${GREEN}🔗 Passo 1: Acesse o DNS Manager do Vercel${NC}"
echo ""
echo "  https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo ""
echo -e "${GREEN}📝 Passo 2: Para cada domínio com erro:${NC}"
echo ""
echo "  1. Clique em 'xyzlogicflow.tech'"
echo "  2. Procure seção 'DNS Records' ou 'Manage DNS'"
echo "  3. Se não houver registros, clique 'Add Record'"
echo ""
echo -e "${GREEN}📊 Passo 3: Adicione os registros:${NC}"
echo ""
echo "  Registro A (domínio raiz):"
echo "  ┌─────────────────────────────────────┐"
echo "  │ Type:  A                            │"
echo "  │ Name:  @                            │"
echo "  │ Value: 216.198.79.1                 │"
echo "  │ TTL:   Auto                         │"
echo "  └─────────────────────────────────────┘"
echo ""
echo "  Registro CNAME (www):"
echo "  ┌─────────────────────────────────────┐"
echo "  │ Type:  CNAME                        │"
echo "  │ Name:  www                          │"
echo "  │ Value: cname.vercel-dns.com         │"
echo "  │ TTL:   Auto                         │"
echo "  └─────────────────────────────────────┘"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ALTERNATIVA - Usar Vercel CLI${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Se o painel do Vercel não mostrar opção de gerenciar DNS,"
echo "execute estes comandos:"
echo ""
echo -e "${YELLOW}# 1. Login no Vercel${NC}"
echo "  vercel login"
echo ""
echo -e "${YELLOW}# 2. Vincular ao projeto${NC}"
echo "  vercel link"
echo ""
echo -e "${YELLOW}# 3. Adicionar domínio com DNS${NC}"
echo "  vercel domains add xyzlogicflow.tech"
echo "  vercel domains add www.xyzlogicflow.tech"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICAÇÃO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Após configurar, aguarde 2-5 minutos e execute:"
echo ""
echo "  ./scripts/check-dns.sh"
echo ""
echo "Ou teste manualmente:"
echo ""
echo "  dig +short A xyzlogicflow.tech"
echo "  # Deve retornar: 216.198.79.1"
echo ""
echo "  dig +short CNAME www.xyzlogicflow.tech"
echo "  # Deve retornar: cname.vercel-dns.com"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  STATUS ATUAL DO DNS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Verificar nameservers
echo -n "  Nameservers: "
NS=$(dig +short NS xyzlogicflow.tech | head -1)
if [[ $NS == *"vercel-dns"* ]]; then
    echo -e "${GREEN}✅ Vercel (correto)${NC}"
else
    echo -e "${RED}❌ $NS${NC}"
fi

# Verificar registro A atual
echo -n "  Registro A:  "
A=$(dig +short A xyzlogicflow.tech)
if [ "$A" == "216.198.79.1" ]; then
    echo -e "${GREEN}✅ 216.198.79.1 (correto)${NC}"
elif [ -z "$A" ]; then
    echo -e "${YELLOW}⏳ Não configurado${NC}"
else
    echo -e "${YELLOW}⚠️  $A (esperado: 216.198.79.1)${NC}"
fi

# Verificar CNAME
echo -n "  CNAME www:   "
CNAME=$(dig +short CNAME www.xyzlogicflow.tech)
if [[ $CNAME == *"vercel-dns.com"* ]]; then
    echo -e "${GREEN}✅ $CNAME (correto)${NC}"
elif [ -z "$CNAME" ]; then
    echo -e "${YELLOW}⏳ Não configurado${NC}"
else
    echo -e "${YELLOW}⚠️  $CNAME${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}💡 RESUMO:${NC}"
echo ""
echo "  1. Acesse: https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo "  2. Clique em cada domínio e adicione os registros DNS acima"
echo "  3. Aguarde 2-5 minutos"
echo "  4. Verifique com: ./scripts/check-dns.sh"
echo ""
echo -e "${GREEN}📚 Documentação:${NC}"
echo "  https://vercel.com/docs/projects/domains/working-with-nameservers"
echo ""
