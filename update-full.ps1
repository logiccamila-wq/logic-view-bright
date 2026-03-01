# Script de Atualizacao Completa: Web + Banco de Dados
# Atualiza o deploy Vercel e sincroniza o schema do banco Neon

Write-Host "OPTILOG.APP - ATUALIZACAO COMPLETA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Git Status
Write-Host "1. Verificando status do repositorio..." -ForegroundColor Yellow
git status --short

$changes = git status --short
if ($changes) {
    Write-Host "Ha alteracoes nao commitadas!" -ForegroundColor Red
    Write-Host ""
    $commit = Read-Host "Deseja commitar as alteracoes? (s/N)"
    
    if ($commit -eq "s" -or $commit -eq "S") {
        $message = Read-Host "Mensagem do commit"
        if (-not $message) {
            $message = "chore: atualizacao automatica $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
        }
        
        Write-Host "Commitando alteracoes..." -ForegroundColor Yellow
        git add .
        git commit -m $message
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao commitar!" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Nenhuma alteracao local pendente" -ForegroundColor Green
}
Write-Host ""

# 2. Push para GitHub
Write-Host "2. Enviando para GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro ao fazer push! Verifique a conexao." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Verificar deploy Vercel
Write-Host "3. Verificando deploy na Vercel..." -ForegroundColor Yellow
Write-Host "   URL: https://optilog-app.vercel.app" -ForegroundColor Cyan
Write-Host "   A Vercel ira detectar o push e iniciar o deploy automaticamente." -ForegroundColor Gray
Write-Host ""

# 4. Atualizar Banco de Dados (se DATABASE_URL estiver configurado)
Write-Host "4. Verificando configuracao do banco de dados..." -ForegroundColor Yellow

if ($env:DATABASE_URL) {
    Write-Host "DATABASE_URL configurado" -ForegroundColor Green
    
    $updateDb = Read-Host "Deseja atualizar o schema do banco? (s/N)"
    
    if ($updateDb -eq "s" -or $updateDb -eq "S") {
        Write-Host "Executando script de setup do banco..." -ForegroundColor Yellow
        
        # Verificar se node_modules existe
        if (-not (Test-Path "node_modules")) {
            Write-Host "Instalando dependencias..." -ForegroundColor Yellow
            npm install
        }
        
        # Executar script de setup
        node backend/scripts/db_setup_full.mjs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Banco de dados atualizado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao atualizar banco. Verifique os logs acima." -ForegroundColor Red
        }
    } else {
        Write-Host "Atualizacao do banco ignorada" -ForegroundColor Gray
    }
} else {
    Write-Host "DATABASE_URL nao configurado" -ForegroundColor Yellow
    Write-Host "   Para configurar o banco de dados:" -ForegroundColor Gray
    Write-Host "   1. Crie arquivo .env.local na raiz do projeto" -ForegroundColor Gray
    Write-Host "   2. Adicione: DATABASE_URL=postgresql://..." -ForegroundColor Gray
    Write-Host "   3. Execute: node backend/scripts/db_setup_full.mjs" -ForegroundColor Gray
    Write-Host "   4. Veja SETUP_DATABASE.md para detalhes" -ForegroundColor Gray
}
Write-Host ""

# 5. Resumo Final
Write-Host "RESUMO DA ATUALIZACAO" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Codigo enviado para GitHub" -ForegroundColor Green
Write-Host "Deploy Vercel: https://optilog-app.vercel.app" -ForegroundColor Cyan
if ($env:DATABASE_URL -and ($updateDb -eq "s" -or $updateDb -eq "S")) {
    Write-Host "Banco de dados atualizado" -ForegroundColor Green
}
Write-Host ""

# 6. Abrir URLs
Write-Host "Deseja abrir os links? (s/N)" -ForegroundColor Yellow
$openLinks = Read-Host

if ($openLinks -eq "s" -or $openLinks -eq "S") {
    Write-Host "Abrindo Vercel Dashboard..." -ForegroundColor Yellow
    Start-Process "https://vercel.com/logiccamila-wq/optilog-app"
    
    Start-Sleep -Seconds 1
    
    Write-Host "Abrindo aplicacao..." -ForegroundColor Yellow
    Start-Process "https://optilog-app.vercel.app"
}

Write-Host ""
Write-Host "Atualizacao completa finalizada!" -ForegroundColor Green
Write-Host ""
