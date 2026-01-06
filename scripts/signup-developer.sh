#!/bin/bash

# Script para criar usuário desenvolvedor via signup normal

echo "🔐 Criando Usuário Desenvolvedor"
echo "=================================="
echo ""
echo "📧 Email: logiccamila@gmail.com"
echo "🔑 Senha: Multi.13"
echo ""
echo "⚠️  IMPORTANTE: Este usuário será criado via signup normal."
echo "   Você precisará confirmar o email se a confirmação estiver habilitada."
echo ""

# Extrair variáveis do .env.local
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
SUPABASE_KEY=$(grep VITE_SUPABASE_PUBLISHABLE_KEY .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Erro: Variáveis SUPABASE_URL ou SUPABASE_KEY não encontradas"
  exit 1
fi

echo "🌐 Supabase URL: $SUPABASE_URL"
echo ""
echo "📤 Criando usuário..."

# Fazer signup
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "logiccamila@gmail.com",
    "password": "Multi.13",
    "data": {
      "name": "Camila - Developer"
    }
  }')

# Verificar resposta
if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ Usuário criado com sucesso!"
  echo ""
  USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "👤 User ID: $USER_ID"
  echo ""
  echo "⚠️  IMPORTANTE: Verifique seu email para confirmar a conta!"
  echo "   Email de confirmação foi enviado para logiccamila@gmail.com"
  echo ""
elif echo "$RESPONSE" | grep -q "already registered"; then
  echo "⚠️  Usuário já existe!"
  echo ""
  echo "✅ Você já pode fazer login com:"
  echo "   📧 Email: logiccamila@gmail.com"
  echo "   🔑 Senha: Multi.13"
  echo ""
else
  echo "❌ Erro ao criar usuário:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "💡 Soluções:"
  echo "   1. O usuário pode já existir - tente fazer login"
  echo "   2. A senha pode não atender aos requisitos mínimos"
  echo "   3. O email pode precisar de confirmação"
  exit 1
fi

echo "🌐 Acesse: https://logic-view-bright.vercel.app/login"
echo ""
echo "📝 Se o login não funcionar, verifique:"
echo "   1. Email de confirmação na caixa de entrada"
echo "   2. Pasta de spam/lixo eletrônico"
echo "   3. Use 'Esqueci minha senha' se necessário"
echo ""
