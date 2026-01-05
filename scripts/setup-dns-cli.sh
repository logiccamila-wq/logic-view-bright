#!/bin/bash
# Configuração automática de DNS via Vercel CLI

echo "🚀 Tentando configurar DNS automaticamente via Vercel CLI"
echo "=========================================================="
echo ""

# Instalar Vercel CLI se não estiver instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel@latest
fi

echo "🔑 Iniciando autenticação..."
echo ""
echo "⚠️  Uma janela do navegador será aberta para autenticação."
echo "   Por favor, faça login com sua conta Vercel."
echo ""

# Login no Vercel
vercel login

echo ""
echo "🔗 Vinculando ao projeto..."
vercel link --yes

echo ""
echo "🌐 Adicionando domínios..."

# Adicionar domínios
echo ""
echo "Adicionando xyzlogicflow.tech..."
vercel domains add xyzlogicflow.tech --yes || echo "⚠️  Domínio já existe ou erro ao adicionar"

echo ""
echo "Adicionando www.xyzlogicflow.tech..."
vercel domains add www.xyzlogicflow.tech --yes || echo "⚠️  Domínio já existe ou erro ao adicionar"

echo ""
echo "📋 Listando domínios configurados..."
vercel domains ls

echo ""
echo "✅ Configuração via CLI concluída!"
echo ""
echo "⏱️  Aguarde 2-5 minutos para propagação DNS"
echo ""
echo "Verifique o status em:"
echo "  https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo ""
echo "Ou execute:"
echo "  ./scripts/check-dns.sh"
echo ""
