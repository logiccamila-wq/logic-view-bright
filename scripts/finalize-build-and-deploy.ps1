param(
    [string]$TargetHost,
    [string]$User,
    [string]$RemotePath,
    [switch]$UseRobocopy,
    [string]$BuildCommand = "npm run build",
    [switch]$SkipTests,
    [switch]$UseVercel,
    [switch]$DryRun
)

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js not found" }
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) { throw "npm not found" }

if (-not $SkipTests) { npm run test --if-present }

if ($DryRun) { Write-Output "DRYRUN $BuildCommand" } else { iex $BuildCommand }

$syncScript = Join-Path -Path (Get-Location) -ChildPath "scripts/sync-and-deploy.ps1"
if (-not (Test-Path $syncScript)) { throw "scripts/sync-and-deploy.ps1 not found" }

& $syncScript -TargetHost:$TargetHost -User:$User -RemotePath:$RemotePath -UseRobocopy:$UseRobocopy -UseVercel:$UseVercel -DryRun:$DryRun
