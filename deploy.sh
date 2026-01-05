#!/bin/bash

# 🚀 Deploy Único - Vercel + Supabase
# Script automático de deploy completo

set -e

echo "🔍 Verificando ambiente..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

echo "📦 Instalando dependências..."
npm install

echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído com sucesso!"

echo ""
echo "📋 Opções de Deploy:"
echo "1. Deploy apenas Frontend (Vercel via Git Push)"
echo "2. Deploy apenas Edge Functions (Supabase)"
echo "3. Deploy completo (Frontend + Functions)"
echo ""

read -p "Escolha uma opção (1-3): " choice

case $choice in
    1)
        echo "🚀 Fazendo commit e push para Vercel..."
        git add .
        read -p "Mensagem do commit: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        echo "✅ Push concluído! Vercel fará deploy automático."
        echo "🌐 Acompanhe em: https://vercel.com/dashboard"
        ;;
    2)
        echo "🚀 Fazendo deploy das Edge Functions no Supabase..."
        supabase functions deploy --no-verify-jwt
        echo "✅ Edge Functions deployadas!"
        ;;
    3)
        echo "🚀 Fazendo deploy completo..."
        
        # Deploy Frontend
        git add .
        read -p "Mensagem do commit: " commit_msg
        git commit -m "$commit_msg" || echo "Sem mudanças para commit"
        git push origin main
        
        # Deploy Edge Functions
        supabase functions deploy --no-verify-jwt
        
        echo "✅ Deploy completo finalizado!"
        echo "🌐 Frontend: https://xyzlogicflow.tech"
        echo "🔧 Supabase: https://supabase.com/dashboard"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy concluído com sucesso!"
