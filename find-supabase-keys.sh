#!/bin/bash

# Script para ajudar a encontrar as credenciais do Supabase

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🔑 ENCONTRANDO CREDENCIAIS DO SUPABASE                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo "📋 MÉTODO 1: Via Supabase Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://supabase.com/dashboard"
echo "2. Faça login com sua conta"
echo "3. Selecione seu projeto"
echo "4. Vá em: Settings → API"
echo "5. Copie:"
echo "   • Project URL → VITE_SUPABASE_URL"
echo "   • anon public → VITE_SUPABASE_ANON_KEY"
echo ""

echo "📋 MÉTODO 2: Verificar arquivos locais"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Procurar por referências ao Supabase
if [ -f ".env" ]; then
    echo "✓ Arquivo .env encontrado:"
    echo ""
    grep "SUPABASE" .env 2>/dev/null || echo "  (sem variáveis SUPABASE configuradas)"
    echo ""
fi

if [ -f ".env.local" ]; then
    echo "✓ Arquivo .env.local encontrado:"
    echo ""
    grep "SUPABASE" .env.local 2>/dev/null
    echo ""
fi

if [ -f ".env.production" ]; then
    echo "✓ Arquivo .env.production encontrado:"
    echo ""
    grep "SUPABASE" .env.production 2>/dev/null
    echo ""
fi

# Procurar no histórico do git (últimos commits)
echo "📋 MÉTODO 3: Verificar commits recentes (se configurado antes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --all --oneline --grep="supabase\|env\|config" -i -10 2>/dev/null | head -5 || echo "(nenhum commit relacionado encontrado)"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  📝 EXEMPLO DE VALORES (SUBSTITUA PELOS SEUS REAIS)       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "VITE_SUPABASE_URL=https://xyzabc123.supabase.co"
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 APÓS PEGAR AS CREDENCIAIS:                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "1. Acesse: https://vercel.com/dashboard"
echo "2. Projeto: logic-view-bright-main"
echo "3. Settings → Environment Variables"
echo "4. Add New → Name: VITE_SUPABASE_URL"
echo "5. Value: (cole a URL do Supabase)"
echo "6. Add New → Name: VITE_SUPABASE_ANON_KEY"
echo "7. Value: (cole a chave anon)"
echo "8. Save"
echo "9. Deployments → Redeploy (ou git push)"
echo ""
echo "✅ Depois de ~2 minutos, seu site estará funcionando!"
echo ""
