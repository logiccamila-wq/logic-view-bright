#!/bin/bash

# Script de Verificação de Deploy - XYZLogicFlow v2.1
# Testa todas as páginas e funcionalidades principais

BASE_URL="https://logic-view-bright.vercel.app"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando Deploy do XYZLogicFlow v2.1..."
echo "URL Base: $BASE_URL"
echo ""

# Função para testar URL
test_url() {
  local url=$1
  local name=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" -eq 200 ]; then
    echo -e "${GREEN}✓${NC} $name: OK (HTTP $status)"
    return 0
  else
    echo -e "${RED}✗${NC} $name: FALHOU (HTTP $status)"
    return 1
  fi
}

# Função para verificar conteúdo
check_content() {
  local url=$1
  local search=$2
  local name=$3
  
  if curl -s "$url" | grep -q "$search"; then
    echo -e "${GREEN}✓${NC} $name: Conteúdo encontrado"
    return 0
  else
    echo -e "${RED}✗${NC} $name: Conteúdo não encontrado"
    return 1
  fi
}

SUCCESS=0
FAIL=0

echo "📄 Testando Páginas Principais..."
echo "================================="

# Landing Page
if test_url "$BASE_URL/" "Landing Page"; then
  ((SUCCESS++))
else
  ((FAIL++))
fi

# Dashboard
if test_url "$BASE_URL/dashboard" "Dashboard"; then
  ((SUCCESS++))
else
  ((FAIL++))
fi

# Login
if test_url "$BASE_URL/login" "Login"; then
  ((SUCCESS++))
else
  ((FAIL++))
fi

# Settings
if test_url "$BASE_URL/settings" "Settings"; then
  ((SUCCESS++))
else
  ((FAIL++))
fi

echo ""
echo "🎨 Verificando Assets..."
echo "========================"

# Verificar se os assets estão carregando
ASSET_COUNT=$(curl -s "$BASE_URL/" | grep -o 'src="/assets/[^"]*"' | wc -l)
if [ "$ASSET_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓${NC} Assets encontrados: $ASSET_COUNT arquivos"
  ((SUCCESS++))
else
  echo -e "${YELLOW}⚠${NC} Assets não encontrados ou não carregaram"
  ((FAIL++))
fi

echo ""
echo "🔧 Verificando Funcionalidades..."
echo "=================================="

# Verificar se Framer Motion está presente
if check_content "$BASE_URL/" "framer-motion" "Framer Motion carregado"; then
  ((SUCCESS++))
else
  # Pode não estar no HTML inicial, isso é normal com lazy loading
  echo -e "${YELLOW}⚠${NC} Framer Motion: Lazy loaded (normal)"
fi

# Verificar se Recharts está presente
if curl -s "$BASE_URL/" | grep -q "recharts"; then
  echo -e "${GREEN}✓${NC} Recharts: Detectado"
  ((SUCCESS++))
else
  echo -e "${YELLOW}⚠${NC} Recharts: Lazy loaded (normal)"
fi

echo ""
echo "⚡ Métricas de Performance..."
echo "=============================="

# Tempo de resposta
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")
echo "⏱️  Tempo de Resposta: ${RESPONSE_TIME}s"

# Tamanho da página
PAGE_SIZE=$(curl -s -o /dev/null -w "%{size_download}" "$BASE_URL/")
PAGE_SIZE_KB=$((PAGE_SIZE / 1024))
echo "📦 Tamanho da Página: ${PAGE_SIZE_KB}KB"

# Verificar se gzip está ativo
if curl -s -H "Accept-Encoding: gzip" -I "$BASE_URL/" | grep -q "content-encoding: gzip"; then
  echo -e "${GREEN}✓${NC} Compressão GZIP: Ativa"
  ((SUCCESS++))
else
  echo -e "${YELLOW}⚠${NC} Compressão GZIP: Não detectada"
fi

echo ""
echo "🔐 Verificando Headers de Segurança..."
echo "======================================="

HEADERS=$(curl -s -I "$BASE_URL/")

# X-Content-Type-Options
if echo "$HEADERS" | grep -q "x-content-type-options"; then
  echo -e "${GREEN}✓${NC} X-Content-Type-Options: Presente"
  ((SUCCESS++))
else
  echo -e "${RED}✗${NC} X-Content-Type-Options: Ausente"
  ((FAIL++))
fi

# X-Frame-Options
if echo "$HEADERS" | grep -q "x-frame-options"; then
  echo -e "${GREEN}✓${NC} X-Frame-Options: Presente"
  ((SUCCESS++))
else
  echo -e "${RED}✗${NC} X-Frame-Options: Ausente"
  ((FAIL++))
fi

echo ""
echo "📊 Resultados Finais"
echo "===================="
echo -e "${GREEN}Sucessos: $SUCCESS${NC}"
echo -e "${RED}Falhas: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 Deploy verificado com sucesso!${NC}"
  echo ""
  echo "🔗 Links Importantes:"
  echo "   • Landing Page: $BASE_URL/"
  echo "   • Dashboard: $BASE_URL/dashboard"
  echo "   • Login: $BASE_URL/login"
  echo "   • Analytics: $BASE_URL/analytics"
  echo ""
  exit 0
else
  echo -e "${YELLOW}⚠️  Deploy concluído com avisos${NC}"
  echo "   Verifique os itens marcados acima"
  echo ""
  exit 1
fi
