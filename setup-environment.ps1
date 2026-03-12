# Setup environment validation for Azure/App Service deployments.

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

function Invoke-Step {
    param(
        [string]$Label,
        [scriptblock]$Command
    )

    Write-Host $Label
    & $Command
    if ($LASTEXITCODE -ne 0) {
        $exitCode = $LASTEXITCODE
        Write-Error "$Label failed."
        exit $exitCode
    }
}

Invoke-Step "Installing npm dependencies..." { npm ci }
Invoke-Step "Running TypeScript checks..." { npm run check }
Invoke-Step "Building production bundle..." { npm run build:azure }

Write-Host "Validation completed. Apply SQL migrations from sql/migrations/ and configure Azure environment variables before deployment."
