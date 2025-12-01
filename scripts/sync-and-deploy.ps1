param(
    [string]$TargetHost,
    [string]$User,
    [string]$RemotePath,
    [switch]$UseRobocopy,
    [switch]$UseVercel,
    [string]$BuildDir = "dist",
    [switch]$DryRun
)

$buildPath = Join-Path -Path (Get-Location) -ChildPath $BuildDir
if (-not (Test-Path $buildPath)) { throw "Build directory not found: $buildPath" }

if ($UseVercel) {
    if ($DryRun) { Write-Output "DRYRUN vercel pull --yes --environment=production"; Write-Output "DRYRUN vercel build"; Write-Output "DRYRUN vercel deploy --prebuilt --prod --yes"; return }
    $vercel = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercel) { throw "Vercel CLI not found" }
    vercel pull --yes --environment=production
    vercel build
    vercel deploy --prebuilt --prod --yes
    return
}

if ($TargetHost -and $User -and $RemotePath) {
    if ($DryRun) {
        Write-Output "DRYRUN deploy to ${User}@${TargetHost}:${RemotePath} from $buildPath"
        return
    }
    if ($UseRobocopy) {
        $dest = "\\$TargetHost\$RemotePath"
        robocopy $buildPath $dest /MIR /NFL /NDL /NP /XO
    } else {
        $scp = Get-Command scp -ErrorAction SilentlyContinue
        if (-not $scp) { throw "scp not found" }
        & scp -r "$buildPath/*" "${User}@${TargetHost}:${RemotePath}"
    }
    return
}

throw "No deployment method specified"
