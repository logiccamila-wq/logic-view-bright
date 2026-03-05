<#
  gemini_cleanup.ps1
  Script PowerShell equivalente ao gemini_cleanup.sh para Windows.
  - Checa espaço em disco e maiores consumidores no HOME
  - Oferece limpezas opcionais (npm, apt via WSL se existir, journalctl se existir, docker)
  - Executa "gemini" com os argumentos repassados e salva saída em JSON
  - Valida JSON (jq se disponível; fallback ConvertFrom-Json)
  - Mostra linhas ao redor de um erro (via variáveis SHOW_JSON_FILE e SHOW_JSON_LINE)
  Observação: nada é apagado sem confirmação.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Pause-Enter([string]$msg) {
  Read-Host "$msg [ENTER para continuar]" | Out-Null
}

function Confirm-Yes([string]$msg) {
  $ans = Read-Host "$msg (s/n): "
  return ($ans -match '^[SsYy]')
}

$homePath = [Environment]::GetFolderPath('UserProfile')
$outDir = Join-Path $homePath 'meus-projetos\gemini-troubleshoot'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host '==> Checando uso de disco (partições)'
Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } |
  Select-Object DeviceID,@{n='Size(GB)';e={[math]::Round($_.Size/1GB,2)}},@{n='Free(GB)';e={[math]::Round($_.FreeSpace/1GB,2)}} |
  Format-Table -AutoSize
Write-Host

Write-Host '==> Maiores diretórios no seu HOME (profundidade 1)'
Get-ChildItem -Directory -Force -LiteralPath $homePath | ForEach-Object {
  $size = 0
  try {
    $size = (Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  } catch { $size = 0 }
  [PSCustomObject]@{ SizeMB = [math]::Round($size/1MB,2); Path = $_.FullName }
} | Sort-Object SizeMB -Descending | Select-Object -First 20 | Format-Table -AutoSize
Write-Host

Write-Host '==> Maiores arquivos no HOME (top 30)'
Get-ChildItem -File -Recurse -Force -ErrorAction SilentlyContinue -LiteralPath $homePath |
  Sort-Object Length -Descending | Select-Object -First 30 |
  ForEach-Object { "{0:N2} MB`t{1}" -f ($_.Length/1MB), $_.FullName }
Write-Host

Pause-Enter 'Revise os itens acima.'

# ------------- Limpeza npm (safe) -------------
if (Confirm-Yes 'Deseja limpar cache do npm e remover diretórios ~/.npm/_cacache ~/.npm/_logs ~/.npm/_npx?') {
  try { npm --version | Out-Null } catch { }
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host 'Executando npm cache clean --force...'
    try { npm cache clean --force } catch { Write-Warning 'npm cache clean falhou; ignorando.' }
  } else { Write-Host 'npm não encontrado; pulando.' }

  foreach($d in @('\.npm\_cacache','\.npm\_logs','\.npm\_npx')) {
    $p = Join-Path $homePath $d
    if (Test-Path $p) { Write-Host "Apagando $p"; Remove-Item -Recurse -Force $p }
    else { Write-Host "Não existe: $p" }
  }
  Write-Host 'Cache npm limpo.'
} else { Write-Host 'Pulando limpeza do npm.' }
Write-Host

# ------------- Limpeza apt (WSL/ambientes Debian) -------------
if (Get-Command apt -ErrorAction SilentlyContinue) {
  if (Confirm-Yes 'Seu sistema parece Debian/Ubuntu. Deseja executar apt autoremove/autoclean/clean (requer sudo)?') {
    try {
      & sudo apt-get autoremove -y
      & sudo apt-get autoclean -y
      & sudo apt-get clean -y
      Write-Host 'Limpeza apt concluída.'
    } catch { Write-Warning 'Falha ao executar apt; ignorando.' }
  } else { Write-Host 'Pulando limpeza apt.' }
}
Write-Host

# ------------- Limpeza journalctl -------------
if (Get-Command journalctl -ErrorAction SilentlyContinue) {
  if (Confirm-Yes 'Deseja reduzir logs do systemd (journalctl) para 200MB? (sudo será usado)') {
    try { & sudo journalctl --vacuum-size=200M } catch { Write-Warning 'Falha no vacuum do journalctl.' }
  } else { Write-Host 'Pulando vacuum do journalctl.' }
}
Write-Host

# ------------- Docker (opcional) -------------
if (Get-Command docker -ErrorAction SilentlyContinue) {
  if (Confirm-Yes 'Você usa Docker? Deseja dar um prune (remove images/containers/networks não usados)?') {
    try { docker system prune -af } catch { Write-Warning 'docker system prune falhou.' }
  } else { Write-Host 'Pulando docker prune.' }
}
Write-Host

# ------------- Node modules cleanup helper (não remover automaticamente) -------------
if (Confirm-Yes 'Deseja listar node_modules grandes encontrados em ~/ (para análise)?') {
  Write-Host 'Buscando node_modules (isso pode demorar)...'
  $paths = Get-ChildItem -Directory -Recurse -Force -ErrorAction SilentlyContinue -LiteralPath $homePath | Where-Object { $_.Name -eq 'node_modules' } | Select-Object -ExpandProperty FullName
  $sizes = foreach ($p in $paths) {
    $sum = 0
    try { $sum = (Get-ChildItem -LiteralPath $p -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum } catch { $sum = 0 }
    [PSCustomObject]@{ SizeMB = [math]::Round($sum/1MB,2); Path = $p }
  }
  $sizes | Sort-Object SizeMB -Descending | Select-Object -First 40 | Format-Table -AutoSize
} else { Write-Host 'Pulando busca por node_modules.' }
Write-Host

# ------------- Rodar gemini e capturar saída -------------
Write-Host 'Para rodar gemini e salvar saída, passe os argumentos do gemini para este script.'
Write-Host 'Ex.: .\gemini_cleanup.ps1 -- <args do gemini>'

$GEMINI_ARGS = $args
if ($GEMINI_ARGS.Count -gt 0) {
  $outfile = Join-Path $outDir ("gemini_out_{0}.json" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))
  Write-Host "Executando: gemini $($GEMINI_ARGS -join ' ')"
  Write-Host "Saída será salva em: $outfile"
  try {
    & gemini @GEMINI_ARGS *>&1 | Tee-Object -FilePath $outfile | Out-Null
  } catch { Write-Warning "gemini retornou não-zero; ver arquivo $outfile" }
  Write-Host "Saída salva em $outfile"

  $jq = Get-Command jq -ErrorAction SilentlyContinue
  if ($jq) {
    try { & jq . "$outfile" *> $null; Write-Host 'JSON válido.' }
    catch {
      Write-Warning 'JSON inválido ou saída não é JSON. Mostrando as 500 primeiras linhas:'
      Get-Content -Path $outfile -TotalCount 500 | Write-Output
      Write-Host "Use SHOW_JSON_FILE e SHOW_JSON_LINE para mostrar contexto."
    }
  } else {
    try { Get-Content $outfile -Raw | ConvertFrom-Json | Out-Null; Write-Host 'JSON válido.' }
    catch {
      Write-Warning 'JSON inválido. Mostrando as 500 primeiras linhas:'
      Get-Content -Path $outfile -TotalCount 500 | Write-Output
    }
  }
} else {
  Write-Host 'Nenhum argumento do gemini passado; pulei a execução do gemini.'
}
Write-Host

function Show-JsonContext([string]$File, [int]$Line) {
  $ctx = 10
  if (-not (Test-Path $File)) { Write-Warning "Arquivo não encontrado: $File"; return }
  $start = [Math]::Max($Line - $ctx, 1)
  $end = $Line + $ctx
  $i = 1
  Get-Content $File | ForEach-Object {
    if ($i -ge $start -and $i -le $end) { "{0,6}: {1}" -f $i, $_ }
    $i++
  }
}

# Validação/Contexto via variáveis de ambiente (opcional)
if ($env:SHOW_JSON_FILE) {
  if (Test-Path $env:SHOW_JSON_FILE) {
    try { Get-Content $env:SHOW_JSON_FILE -Raw | ConvertFrom-Json | Out-Null; Write-Host 'JSON válido.' }
    catch { Write-Warning 'JSON inválido.' }
    if ($env:SHOW_JSON_LINE) { Show-JsonContext -File $env:SHOW_JSON_FILE -Line ([int]$env:SHOW_JSON_LINE) }
  } else { Write-Warning 'SHOW_JSON_FILE definido mas arquivo não existe.' }
}

Write-Host "Todas as operações concluídas. Arquivos e logs foram salvos em: $outDir"
Write-Host 'Se quiser, informe SHOW_JSON_FILE e SHOW_JSON_LINE para mostrar contexto ao redor de uma linha.'