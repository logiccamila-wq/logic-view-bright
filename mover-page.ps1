# mover-page.ps1
# Execute este script estando dentro da pasta frontend:
#   cd <path-to>/optilog-app/frontend
#   .\mover-page.ps1

$cwd = Get-Location
$src = Join-Path $cwd 'page.tsx'
$destDir = Join-Path $cwd 'app'
$dest = Join-Path $destDir 'page.tsx'

if (-Not (Test-Path $src)) {
    Write-Host "ERRO: arquivo 'page.tsx' não encontrado em $cwd" -ForegroundColor Red
    exit 1
}

# backup
$backupDir = Join-Path $cwd ('backup_frontend_' + (Get-Date -Format "yyyyMMdd_HHmmss"))
New-Item -ItemType Directory -Path $backupDir | Out-Null
Copy-Item -Path $src -Destination $backupDir
Write-Host "Backup criado em: $backupDir"

# cria app/ se não existir
if (-Not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Pasta 'app' criada."
}

# mover arquivo (tratando se já existir destino)
if (Test-Path $dest) {
    $suffix = (Get-Date -Format "yyyyMMdd_HHmmss")
    $newName = "page.tsx.duplicated.$suffix"
    Move-Item -Path $src -Destination (Join-Path $backupDir $newName)
    Write-Host "ATENÇÃO: já existia app/page.tsx. Seu page.tsx foi movido para o backup como: $newName" -ForegroundColor Yellow
} else {
    # usa git mv quando for repositório git (preserva histórico)
    if (Test-Path (Join-Path $cwd '.git')) {
        git mv $src $dest
        Write-Host "Arquivo movido com 'git mv'."
    } else {
        Move-Item -Path $src -Destination $dest
        Write-Host "Arquivo movido."
    }
}

# Commit automático se for repositório git
if (Test-Path (Join-Path $cwd '.git')) {
    git add .
    git commit -m "Move frontend/page.tsx → frontend/app/page.tsx (automatizado)"
    Write-Host "Commit criado." -ForegroundColor Green
} else {
    Write-Host "Não é um repositório git — nenhum commit foi feito." -ForegroundColor Yellow
}

Write-Host "Pronto. Verifique o arquivo em: $dest"
