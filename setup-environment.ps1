# Setup environment validation for Azure/App Service deployments.

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Installing npm dependencies..."
npm ci
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running TypeScript checks..."
npm run check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building production bundle..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Validation completed. Apply SQL migrations from sql/migrations/ and configure Azure environment variables before deployment."
