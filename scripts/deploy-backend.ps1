# Script de Deploy Automático do Backend (Banco de Dados + Funções)
# Execute este script no PowerShell

Write-Host "Iniciando Deploy do Backend Supabase..." -ForegroundColor Cyan

# Verificar se o CLI do Supabase está instalado
if (-not (Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js/NPM não encontrado. Instale o Node.js primeiro."
    exit
}

# Tentar login se necessário
Write-Host "Verificando login..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1
if ($loginCheck -match "Access token not provided") {
    Write-Host "Você precisa se autenticar no Supabase." -ForegroundColor Red
    Write-Host "1. Acesse https://supabase.com/dashboard/account/tokens"
    Write-Host "2. Gere um novo token e copie-o."
    $token = Read-Host "Cole seu Access Token aqui"
    
    if ($token) {
        npx supabase login --token $token
    } else {
        Write-Error "Token não fornecido. Abortando."
        exit
    }
}

# Aplicar Migrations (Banco de Dados)
Write-Host "Aplicando alterações no Banco de Dados..." -ForegroundColor Yellow
npx supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao aplicar migrations. Tentando linkar projeto..." -ForegroundColor Red
    $projectId = Read-Host "Informe o ID do Projeto Supabase (ex: eixkvksttadhukucohda)"
    if ($projectId) {
        npx supabase link --project-ref $projectId
        npx supabase db push
    }
}

# Deploy das Functions
Write-Host "Fazendo deploy das Edge Functions..." -ForegroundColor Yellow
npx supabase functions deploy --no-verify-jwt

Write-Host "Deploy Concluído com Sucesso! 🚀" -ForegroundColor Green
Read-Host "Pressione Enter para sair"
