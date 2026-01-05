#!/bin/bash

# Script para verificar configuração DNS do domínio xyzlogicflow.tech
# Uso: ./scripts/check-dns.sh

DOMAIN="xyzlogicflow.tech"
WWW_DOMAIN="www.xyzlogicflow.tech"

echo "🔍 Verificando DNS para $DOMAIN"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se dig está instalado
if ! command -v dig &> /dev/null; then
    echo -e "${RED}❌ 'dig' não encontrado. Instalando...${NC}"
    sudo apt-get update && sudo apt-get install -y dnsutils
fi

echo "📍 1. Verificando Nameservers:"
echo "------------------------------"
NS_RESULT=$(dig NS $DOMAIN +short)
echo "$NS_RESULT"

if echo "$NS_RESULT" | grep -q "cloudflare"; then
    echo -e "${GREEN}✅ Nameservers do Cloudflare detectados${NC}"
elif echo "$NS_RESULT" | grep -q "vercel"; then
    echo -e "${GREEN}✅ Nameservers do Vercel detectados${NC}"
else
    echo -e "${YELLOW}⚠️  Nameservers customizados detectados${NC}"
fi
echo ""

echo "📍 2. Verificando Registro A para $DOMAIN:"
echo "------------------------------"
A_RESULT=$(dig A $DOMAIN +short)
if [ -z "$A_RESULT" ]; then
    echo -e "${RED}❌ Nenhum registro A encontrado${NC}"
else
    echo "$A_RESULT"
    if echo "$A_RESULT" | grep -qE "76\.76\.|75\.2\."; then
        echo -e "${GREEN}✅ IP do Vercel detectado${NC}"
    else
        echo -e "${YELLOW}⚠️  IP não parece ser do Vercel${NC}"
    fi
fi
echo ""

echo "📍 3. Verificando Registro CNAME para $WWW_DOMAIN:"
echo "------------------------------"
CNAME_RESULT=$(dig CNAME $WWW_DOMAIN +short)
if [ -z "$CNAME_RESULT" ]; then
    echo -e "${RED}❌ Nenhum registro CNAME encontrado${NC}"
else
    echo "$CNAME_RESULT"
    if echo "$CNAME_RESULT" | grep -q "vercel"; then
        echo -e "${GREEN}✅ CNAME apontando para Vercel${NC}"
    else
        echo -e "${YELLOW}⚠️  CNAME não parece apontar para o Vercel${NC}"
    fi
fi
echo ""

echo "📍 4. Verificando resolução completa:"
echo "------------------------------"
echo "Domínio raiz ($DOMAIN):"
dig $DOMAIN +noall +answer
echo ""
echo "Subdomínio www ($WWW_DOMAIN):"
dig $WWW_DOMAIN +noall +answer
echo ""

echo "📍 5. Teste de conectividade HTTP/HTTPS:"
echo "------------------------------"
echo "Testando https://$DOMAIN ..."
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -qE "200|301|302"; then
    echo -e "${GREEN}✅ HTTPS funcionando${NC}"
else
    echo -e "${RED}❌ HTTPS não está respondendo corretamente${NC}"
fi

echo "Testando https://$WWW_DOMAIN ..."
if curl -s -o /dev/null -w "%{http_code}" "https://$WWW_DOMAIN" | grep -qE "200|301|302"; then
    echo -e "${GREEN}✅ HTTPS funcionando no www${NC}"
else
    echo -e "${RED}❌ HTTPS não está respondendo corretamente no www${NC}"
fi
echo ""

echo "📍 6. Propagação DNS Global:"
echo "------------------------------"
echo "Verificando servidores DNS em diferentes localizações..."
echo ""

# Servidores DNS de diferentes regiões
declare -A DNS_SERVERS=(
    ["Google"]="8.8.8.8"
    ["Cloudflare"]="1.1.1.1"
    ["OpenDNS"]="208.67.222.222"
)

for name in "${!DNS_SERVERS[@]}"; do
    server="${DNS_SERVERS[$name]}"
    result=$(dig @$server $DOMAIN +short | head -1)
    if [ -n "$result" ]; then
        echo -e "$name ($server): ${GREEN}$result${NC}"
    else
        echo -e "$name ($server): ${RED}Não resolvido${NC}"
    fi
done
echo ""

echo "=================================="
echo "✅ Verificação completa!"
echo ""
echo "📚 Para mais informações, consulte:"
echo "   - MIGRAR_CLOUDFLARE_VERCEL.md (guia de migração)"
echo "   - CONFIGURAR_DOMINIO_VERCEL.md"
echo "   - https://vercel.com/docs/concepts/projects/domains"
echo ""
echo "🔗 Ferramentas online úteis:"
echo "   - https://dnschecker.org"
echo "   - https://whatsmydns.net"
echo "   - https://mxtoolbox.com/SuperTool.aspx?action=a:$DOMAIN"
echo ""
echo "💡 Dica: Se está migrando do Cloudflare para Vercel,"
echo "   veja o guia completo em MIGRAR_CLOUDFLARE_VERCEL.md"
