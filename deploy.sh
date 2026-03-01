#!/bin/bash
set -e  # Sair imediatamente se qualquer comando falhar

echo "🚀 Iniciando deploy automático Optilog..."

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# 1. Verificar conexão com internet
echo "🌐 Verificando conexão..."
if curl -s --max-time 5 https://www.google.com > /dev/null 2>&1 || wget -q --spider --timeout=5 https://www.google.com > /dev/null 2>&1; then
    log_success "Conexão verificada"
else
    log_warning "Não foi possível verificar conexão (continuando...)"
fi

# 2. Atualizar repositório local
echo "📥 Atualizando repositório local..."
if git fetch origin && git pull origin main; then
    log_success "Repositório atualizado"
else
    log_warning "Falha ao atualizar repositório (continuando...)"
fi

# 3. Instalar dependências
echo "📦 Instalando dependências..."
if npm install; then
    log_success "Dependências instaladas"
else
    log_error "Falha ao instalar dependências"
    exit 1
fi

# 4. Fazer build
echo "🏗️  Gerando build de produção..."
if npm run build; then
    log_success "Build gerado com sucesso"
else
    log_error "Falha no build. Verifique os erros acima."
    exit 1
fi

# 5. Verificar se há mudanças para commitar
echo "📝 Verificando alterações..."
if git diff-index --quiet HEAD --; then
    log_warning "Nenhuma alteração para commitar"
else
    git add .
    if git commit -m "chore: deploy automático via Codespaces 🚀 [$(date +'%Y-%m-%d %H:%M')]"; then
        log_success "Alterações commitadas"
    else
        log_error "Falha ao commitar alterações"
        exit 1
    fi
fi

# 6. Enviar para o GitHub
echo "⬆️  Enviando para o repositório remoto..."
if git push origin main; then
    log_success "Push para GitHub concluído"
else
    log_error "Falha ao fazer push. Verifique suas credenciais."
    exit 1
fi

# 7. Git Integration Deploy (Vercel)
echo "🌐 Deploy configurado via Git Integration (Vercel)..."
log_success "Push concluído - Vercel iniciará deploy automaticamente"
echo "📊 Acompanhe em: https://vercel.com/logiccamila-wqs-projects/optilog-app"

# 8. Exibir URL de produção
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Deploy finalizado com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌍 URL de Produção: https://optilog-app-logiccamila-wqs-projects.vercel.app"
echo "📊 Dashboard Vercel: https://vercel.com/logiccamila-wqs-projects/optilog-app"
echo "📦 GitHub: https://github.com/logiccamila-wq/optilog.app"
echo ""
log_success "Tudo pronto! 🎉"
