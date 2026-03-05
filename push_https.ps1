<#
push_https.ps1

Helper para empurrar a branch `ci/remove-firebase-vercel-neon` usando HTTPS + PAT.

Como funciona:
- Se a variável de ambiente GITHUB_PAT estiver definida, o script usará esse token temporariamente
  embutido no remote para efetuar o push (não persiste o token no remoto após o push).
- Caso contrário, o script troca o remoto para HTTPS sem token e faz `git push`, permitindo que o
  Git solicite credenciais (use seu username GitHub e cole o PAT como senha quando pedido).

Uso:
  Abra PowerShell na raiz do repositório e rode:
    .\push_https.ps1

Recomendações de PAT (Personal Access Token):
- Crie um PAT em https://github.com/settings/tokens com scopes: repo, workflow, write:packages (se for publicar imagens no GHCR).
- Em vez de embutir o token no URL permanentemente, prefira o Git Credential Manager (https://aka.ms/gcm/win) ou exportar só durante a sessão:
    $env:GITHUB_PAT = 'seu_token_aqui'

Observação: este script realiza alterações temporárias no remote; não deixará o token gravado no arquivo de configuração.
#>

Set-StrictMode -Version Latest

function Write-Info($m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Err($m) { Write-Host "[ERROR] $m" -ForegroundColor Red }

$branch = 'ci/remove-firebase-vercel-neon'
$repo = 'logiccamila-wq/optilog.app'

Write-Info "Verificando repositório e branch atual..."
if (-not (Test-Path .git)) { Write-Err "Não parece ser a raiz de um repositório git."; exit 1 }

$current = git rev-parse --abbrev-ref HEAD 2>$null
if ($LASTEXITCODE -ne 0) { Write-Err "git não está disponível ou não é um repositório."; exit 1 }
Write-Info "Branch atual: $current"

if ($current -ne $branch) {
    Write-Info "Fazendo checkout em $branch"
    git checkout $branch
    if ($LASTEXITCODE -ne 0) { Write-Err "Falha ao trocar para $branch"; exit 1 }
}

# Salva o remote atual
$origRemote = git remote get-url origin 2>$null

if ($env:GITHUB_PAT) {
    Write-Info "GITHUB_PAT detectado. Usando token temporário para push (não será persistido)."
    $pushUrl = "https://$($env:GITHUB_PAT)@github.com/$repo.git"
    git remote set-url origin $pushUrl
    git push -u origin $branch
    $rc = $LASTEXITCODE
    # Restaura URL original (sem token) se possível
    if ($origRemote) { git remote set-url origin $origRemote } else { git remote set-url origin "https://github.com/$repo.git" }
    if ($rc -ne 0) { Write-Err "git push falhou com código $rc"; exit $rc }
    Write-Info "Push realizado com sucesso usando GITHUB_PAT. (Remoto restaurado)"
    exit 0
}

Write-Info "Nenhum GITHUB_PAT detectado. Vou trocar o remote para HTTPS e tentar o push — você deverá fornecer credenciais quando solicitado."
git remote set-url origin "https://github.com/$repo.git"
git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Err "git push falhou. Se a falha for de autenticação, crie um PAT em https://github.com/settings/tokens e execute:"
    Write-Host "`$env:GITHUB_PAT = 'SEU_TOKEN_AQUI' ; .\\push_https.ps1`" -ForegroundColor Yellow
    Write-Host "Ou instale o Git Credential Manager: https://aka.ms/gcm/win" -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Info "Push realizado com sucesso via HTTPS. Se preferir, configure Git Credential Manager para evitar prompts futuros."
exit 0
