<# 
 .SYNOPSIS 
 Deploy completo do Optilog-App com backup seguro, DB reset, seeds, serviços e health checks. 
 #> 
 
 param ( 
     [switch]$SkipDocker, 
     [switch]$SkipBackupExtras, 
     [switch]$FullResetDb, 
     [switch]$WaitForDb, 
     [int]$BackendPort = 3011, 
     [int]$TireOpsPort = 3001 
 ) 
 
 $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition 
 $LogFile = Join-Path $ScriptDir "deploy_full_ultra.log" 
 
 function Write-Log { 
     param([string]$Message) 
     $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss" 
     $FullMessage = "$Timestamp - $Message" 
     Write-Output $FullMessage 
     Add-Content -Path $LogFile -Value $FullMessage 
 } 
 
 Write-Log "=== Iniciando Deploy Ultra-Agressivo ===" 
 
 # Backup seguro 
 if (-not $SkipBackupExtras) { 
     Write-Log "Movendo arquivos extras para backup_extras (exceto .py, .env, .md, .json, .ts, .js, .tsx, .css, imagens)" 
     $Modules = @("backend","optilog-app","tire-ops\backend","tire-ops\frontend","ml-service","streamlit-app") 
     foreach ($mod in $Modules) { 
         $modPath = Join-Path $ScriptDir $mod 
         if (Test-Path $modPath) { 
             $backupDir = Join-Path $modPath "backup_extras" 
             New-Item -ItemType Directory -Force -Path $backupDir | Out-Null 
             Get-ChildItem $modPath -Recurse -File | Where-Object {
                $_.Extension -notin ".py",".mjs",".cjs",".jsx",".env",".md",".json",".ts",".js",".tsx",".css",".png",".jpg",".jpeg",".svg"
            } | ForEach-Object {
                try {
                    Move-Item $_.FullName -Destination $backupDir -Force -ErrorAction Stop
                } catch {
                    Write-Log "Backup skip: $($_.FullName) -> $backupDir ($($_.Exception.Message))"
                }
            } 
         } 
     } 
 } 
 
 # Docker provision 
 if (-not $SkipDocker) { 
     $DockerComposePath = Join-Path $ScriptDir "tire-ops\docker-compose.yml" 
     if (Test-Path $DockerComposePath) { 
         Write-Log "Subindo Postgres e pgAdmin via Docker Compose" 
         Push-Location (Split-Path $DockerComposePath) 
         docker compose up -d 2>&1 | ForEach-Object { Write-Log $_ } 
         Pop-Location 
     } else { 
         Write-Log "Docker Compose não encontrado, pulando provisionamento" 
     } 
 } 
 
 # Espera PostgreSQL 
 if ($WaitForDb) { 
     Write-Log "Aguardando PostgreSQL na porta 5432..." 
     while (-not (Test-NetConnection -ComputerName "localhost" -Port 5432).TcpTestSucceeded) { 
         Start-Sleep -Seconds 2 
     } 
     Write-Log "PostgreSQL pronto!" 
 } 
 
 # Garantir DATABASE_URL 
 $BackendEnv = Join-Path $ScriptDir "backend\.env" 
 if (-not (Test-Path $BackendEnv)) { New-Item -ItemType File -Path $BackendEnv | Out-Null } 
 if (-not (Select-String -Path $BackendEnv -Pattern "DATABASE_URL")) { 
     Add-Content -Path $BackendEnv -Value "DATABASE_URL=postgres://postgres:postgres@localhost:5432/optilog" 
     Write-Log "DATABASE_URL adicionado ao backend\.env" 
 } else { 
     Write-Log "DATABASE_URL já existe, mantendo valor atual" 
 } 
 
 # Instalar dependências 
 $DepsModules = @("backend","optilog-app","tire-ops\backend","tire-ops\frontend") 
 foreach ($mod in $DepsModules) { 
     $modPath = Join-Path $ScriptDir $mod 
     if (Test-Path (Join-Path $modPath "package.json")) { 
         Write-Log "Instalando dependências em $mod..." 
         Push-Location $modPath 
         npm install 2>&1 | ForEach-Object { Write-Log $_ } 
         Pop-Location 
     } 
 } 
 
 # Dependências Python (ML e Streamlit)
 if (Get-Command pip -ErrorAction SilentlyContinue) {
     Write-Log "Instalando dependências Python (pip)"
     # ML Service
     $mlPath = Join-Path $ScriptDir "ml-service"
     if (Test-Path (Join-Path $mlPath "requirements.txt")) {
         Push-Location $mlPath
         pip install -r requirements.txt 2>&1 | ForEach-Object { Write-Log $_ }
         Pop-Location
     } else {
         Write-Log "ml-service/requirements.txt não encontrado; pulando"
     }
     # Streamlit
     $stPath = Join-Path $ScriptDir "streamlit-app"
     Push-Location $stPath
     pip install streamlit 2>&1 | ForEach-Object { Write-Log $_ }
     Pop-Location
 } else {
     Write-Log "pip não encontrado; pulando instalação de dependências Python"
 }
 
 # DB Setup 
 Push-Location (Join-Path $ScriptDir "backend") 
 if ($FullResetDb) { 
     Write-Log "Executando reset completo do banco (db:setup-full)" 
     npm run db:setup-full 2>&1 | ForEach-Object { Write-Log $_ } 
 } else { 
     Write-Log "Executando seed idempotente (db:setup)" 
     npm run db:setup 2>&1 | ForEach-Object { Write-Log $_ } 
 } 
 Pop-Location 
 
 # Start services 
  function Start-ServiceWindow($Name, $Command, $Path) {
      Write-Log "Iniciando $Name..."
      Start-Process pwsh -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", "cd `"$Path`"; $Command"
  }
  
  # Backend principal 
  Start-ServiceWindow "Backend" "$env:PORT=$BackendPort; npm start" (Join-Path $ScriptDir "backend") 
  # Next.js 
  Start-ServiceWindow "Next.js" "npm run dev" $ScriptDir 
 # Tire Ops backend/frontend 
 Start-ServiceWindow "TireOps Backend" "$env:PORT=$TireOpsPort; npm run dev" (Join-Path $ScriptDir "tire-ops\backend") 
 Start-ServiceWindow "TireOps Frontend" "npm run dev" (Join-Path $ScriptDir "tire-ops\frontend") 
 # ML Service 
 Start-ServiceWindow "ML Service" "python app.py" (Join-Path $ScriptDir "ml-service") 
 # Streamlit 
 Start-ServiceWindow "Streamlit" "streamlit run app.py" (Join-Path $ScriptDir "streamlit-app") 
 
 # Health Checks 
 Start-Sleep -Seconds 8 
 $HealthUrls = @( 
     "Next Status=http://localhost:3000/nextServer/status", 
     "Next DB=http://localhost:3000/api/health", 
     "Backend=http://localhost:$BackendPort/health", 
     "TireOps=http://localhost:$TireOpsPort/api/health", 
     "Streamlit=http://localhost:8501" 
 ) 
 foreach ($h in $HealthUrls) { 
     $parts = $h.Split("=") 
     $name = $parts[0] 
     $url = $parts[1] 
     try { 
         $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 
         if ($resp.StatusCode -eq 200) { 
             Write-Log "$name OK - $url" 
         } else { 
             Write-Log "$name FAIL - $url (Status: $($resp.StatusCode))" 
         } 
     } catch { 
         Write-Log "$name FAIL - $url ($_ )" 
     } 
 } 
 
 Write-Log "=== Deploy Ultra-Agressivo Concluído ==="