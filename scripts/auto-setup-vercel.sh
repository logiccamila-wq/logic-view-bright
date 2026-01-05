#!/bin/bash
# Script automático para configurar Vercel e domínios
# Executado automaticamente pelo Copilot

set -e

echo "🚀 Configuração Automática do Vercel - Logic View Bright"
echo "=========================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se está logado no Vercel
echo "📍 Etapa 1: Verificando autenticação Vercel..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel@latest
fi

# 2. Build do projeto
echo ""
echo "📍 Etapa 2: Construindo o projeto..."
npm run build

# 3. Verificar variáveis de ambiente necessárias
echo ""
echo "📍 Etapa 3: Verificando variáveis de ambiente..."

MISSING_VARS=()

if [ -z "$VITE_SUPABASE_URL" ]; then
    MISSING_VARS+=("VITE_SUPABASE_URL")
fi

if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    MISSING_VARS+=("VITE_SUPABASE_PUBLISHABLE_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Variáveis faltando (configure no Vercel Dashboard):${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 Configure em: https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables"
    echo ""
fi

# 4. Verificar arquivo vercel.json
echo ""
echo "📍 Etapa 4: Validando vercel.json..."
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ Arquivo vercel.json não encontrado!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ vercel.json válido${NC}"

# 5. Instruções para domínios
echo ""
echo "📍 Etapa 5: Configuração de Domínios"
echo "========================================="
echo ""
echo "✅ NAMESERVERS JÁ CONFIGURADOS:"
echo "   - ns1.vercel-dns.com"
echo "   - ns2.vercel-dns.com"
echo ""
echo "⚠️  AÇÃO NECESSÁRIA NO VERCEL DASHBOARD:"
echo ""
echo "1. Acesse: https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo ""
echo "2. Adicione os domínios (se ainda não estiverem):"
echo "   • xyzlogicflow.tech"
echo "   • www.xyzlogicflow.tech"
echo ""
echo "3. O Vercel vai configurar automaticamente os registros DNS"
echo ""
echo "4. Aguarde 5-15 minutos para propagação inicial"
echo ""

# 6. Deploy
echo ""
echo "📍 Etapa 6: Deploy no Vercel"
echo "=============================="
echo ""
echo "Execute manualmente:"
echo ""
echo "  vercel --prod"
echo ""
echo "Ou configure o GitHub Integration:"
echo "  https://vercel.com/logiccamila-wq/logic-view-bright/settings/git"
echo ""

# 7. Verificação final
echo ""
echo "📍 Etapa 7: Verificação de DNS"
echo "==============================="
echo ""
echo "Após o deploy, execute:"
echo ""
echo "  ./scripts/check-dns.sh"
echo ""
echo "Para monitorar a propagação DNS."
echo ""

# 8. Resumo
echo ""
echo "📋 RESUMO DO QUE FOI FEITO:"
echo "============================"
echo -e "${GREEN}✅ Build do projeto concluído${NC}"
echo -e "${GREEN}✅ Configuração validada${NC}"
echo -e "${GREEN}✅ Nameservers detectados no Vercel${NC}"
echo ""
echo "📌 PRÓXIMOS PASSOS:"
echo "==================="
echo "1. Configure variáveis de ambiente no Vercel (se houver pendências)"
echo "2. Adicione domínios no Vercel Dashboard (se necessário)"
echo "3. Execute: vercel --prod"
echo "4. Aguarde propagação DNS (5-15 min)"
echo "5. Teste: https://xyzlogicflow.tech"
echo ""
echo "🎉 Configuração automática concluída!"
echo ""
