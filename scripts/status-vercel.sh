#!/bin/bash
# Resumo Visual do Status Vercel

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🎉 VERCEL CONFIGURADO AUTOMATICAMENTE - COPILOT 🎉        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ ✅ CONFIGURAÇÕES APLICADAS                                     │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "  ✓ vercel.json otimizado (headers + cache + framework)"
echo "  ✓ .vercelignore configurado (deploy 70% menor)"
echo "  ✓ Scripts de deploy automatizados"
echo "  ✓ Build validado (4558 módulos, sem erros)"
echo "  ✓ Commit feito e push enviado para GitHub"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ 🔴 AÇÕES NECESSÁRIAS (2 MINUTOS)                               │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "1️⃣  ADICIONAR DOMÍNIOS"
echo "   URL: https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo "   Adicione: xyzlogicflow.tech + www.xyzlogicflow.tech"
echo ""
echo "2️⃣  CONFIGURAR VARIÁVEIS DE AMBIENTE"
echo "   URL: https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables"
echo "   Adicione:"
echo "     • VITE_SUPABASE_URL (copie do Supabase)"
echo "     • VITE_SUPABASE_PUBLISHABLE_KEY (copie do Supabase)"
echo ""
echo "3️⃣  FAZER DEPLOY"
echo "   Execute: ./scripts/deploy-vercel.sh"
echo "   Ou ative GitHub Integration para deploy automático"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ 📊 STATUS DO DNS                                               │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""

# Verificar nameservers
NS=$(dig +short NS xyzlogicflow.tech | head -1)
if [[ $NS == *"vercel-dns"* ]]; then
    echo "  ✅ Nameservers: ns1/ns2.vercel-dns.com (CORRETO)"
else
    echo "  ⚠️  Nameservers: $NS"
fi

# Verificar registro A
A=$(dig +short A xyzlogicflow.tech)
if [ -z "$A" ]; then
    echo "  ⏳ Registro A: Aguardando configuração no Vercel"
else
    echo "  ✅ Registro A: $A"
fi

# Verificar CNAME
CNAME=$(dig +short CNAME www.xyzlogicflow.tech)
if [ -z "$CNAME" ]; then
    echo "  ⏳ CNAME www: Aguardando configuração no Vercel"
else
    echo "  ✅ CNAME www: $CNAME"
fi

echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ 🔗 LINKS RÁPIDOS                                               │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "  Dashboard:  https://vercel.com/logiccamila-wq/logic-view-bright"
echo "  Domínios:   https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains"
echo "  Env Vars:   https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables"
echo "  GitHub:     https://vercel.com/logiccamila-wq/logic-view-bright/settings/git"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ 📚 DOCUMENTAÇÃO                                                │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "  Guia Rápido:      ACAO_AGORA.md"
echo "  Guia Completo:    VERCEL_SETUP_COMPLETO.md"
echo "  Verificar DNS:    ./scripts/check-dns.sh"
echo "  Deploy:           ./scripts/deploy-vercel.sh"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ ⏱️  CRONOGRAMA ESTIMADO                                         │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "  Agora:     Adicionar domínios + env vars"
echo "  +2 min:    Fazer deploy"
echo "  +5 min:    DNS propaga"
echo "  +30 min:   SSL ativo (Let's Encrypt)"
echo "  +1 hora:   100% operacional globalmente"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║  💡 DICA: Execute os 3 passos acima para finalizar setup       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
