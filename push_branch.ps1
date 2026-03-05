<#
Simple helper script to push the local branch `ci/remove-firebase-vercel-neon` to origin
and optionally create a PR using `gh` if installed.

Usage (PowerShell):
  - Open PowerShell as Administrator (recommended for starting ssh-agent service).
  - cd to the repository root where this script lives.
  - Run: .\push_branch.ps1

This script will:
  1. Ensure the GitHub host key is present in your known_hosts (non-interactive).
  2. Try to start the ssh-agent service and add your default key (id_ed25519 or id_rsa).
  3. If you don't have a key, it can optionally generate one (you will be prompted).
  4. Push the branch `ci/remove-firebase-vercel-neon` to `origin` via SSH.
  5. If the GitHub CLI (`gh`) is available and authenticated, it will offer to create a PR.

Notes:
  - If you prefer HTTPS+PAT, run the HTTPS commands shown in the README or in the script comments.
  - If ssh-agent can't be started due to OS restrictions, add your key manually or use the Windows
    Credential Manager + HTTPS+PAT approach.
#>

Set-StrictMode -Version Latest

function Write-Info($m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Err($m) { Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Info "Repo: $(Get-Location)"

$branch = 'ci/remove-firebase-vercel-neon'

Write-Info "Checking current branch..."
$current = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $?) { Write-Err "Not a git repository or git not installed."; exit 1 }
Write-Info "Current branch: $current"
if ($current -ne $branch) {
    Write-Info "Checking out branch $branch"
    git checkout $branch
    if (-not $?) { Write-Err "Failed to checkout $branch"; exit 1 }
}

Write-Info "Adding GitHub host key to known_hosts (non-interactive)"
if (-not (Test-Path "$env:USERPROFILE\.ssh")) { New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" | Out-Null }
ssh-keyscan github.com 2>$null | Out-File -FilePath "$env:USERPROFILE\.ssh\known_hosts" -Encoding ascii -Append

Write-Info "Attempting to start ssh-agent (may require Administrator)."
try {
    Start-Service ssh-agent -ErrorAction Stop
} catch {
    Write-Info "Could not start ssh-agent service. You may need to run PowerShell as Administrator or add your key manually."
}

# Find default key
$keyPath = "$env:USERPROFILE\.ssh\id_ed25519"
if (-not (Test-Path $keyPath)) { $keyPath = "$env:USERPROFILE\.ssh\id_rsa" }

if (-not (Test-Path $keyPath)) {
    Write-Info "No default SSH key found. You can generate one now (press Enter to continue) or cancel (Ctrl+C)."
    Read-Host "Press Enter to generate a default ed25519 key (recommended) or Ctrl+C to abort"
    ssh-keygen -t ed25519 -C "$(git config user.email)" -f "$env:USERPROFILE\.ssh\id_ed25519"
    $keyPath = "$env:USERPROFILE\.ssh\id_ed25519"
    Write-Info "Key generated at $keyPath. Copy the public key and add it to GitHub:"
    Write-Host "`n--- PUBLIC KEY START ---`n" -NoNewline
    Get-Content "$keyPath.pub"
    Write-Host "`n--- PUBLIC KEY END ---`n"
    Write-Host "Open https://github.com/settings/ssh/new and paste the key. Press Enter when done."
    Read-Host
}

Write-Info "Adding SSH key to agent (ssh-add). You may be prompted for key passphrase."
ssh-add $keyPath 2>$null

Write-Info "Testing SSH authentication to GitHub (non-fatal)"
ssh -T git@github.com 2>&1 | Out-Host

Write-Info "Pushing branch $branch to origin via SSH"
git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Err "git push failed. If the error is authentication, consider using HTTPS+PAT or ensure your SSH key is on GitHub."
    Write-Host "HTTPS alternative (replace with your repo):`n"
    Write-Host "git remote remove origin`n git remote add origin https://github.com/logiccamila-wq/optilog.app.git`n git push -u origin $branch`n" -ForegroundColor Yellow
    exit 1
}

Write-Info "Push finished. If you want to create a Pull Request, the script can try with 'gh' (GitHub CLI)."
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Info "Detected 'gh' CLI. Creating PR..."
    gh pr create --base main --head $branch --title "Remove Firebase + Add CI" --body-file PR_DRAFT.md
} else {
    Write-Info "'gh' CLI not found. To create a PR run locally:"
    Write-Host "gh auth login`ngh pr create --base main --head $branch --title \"Remove Firebase + Add CI\" --body-file PR_DRAFT.md" -ForegroundColor Cyan
}

Write-Info "Done. Verify on GitHub: https://github.com/logiccamila-wq/optilog.app/pulls"
