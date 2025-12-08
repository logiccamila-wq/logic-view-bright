<# 
 .SYNOPSIS 
   Wrapper para atualizar repo, preparar .env.local, instalar deps, lint/typecheck/build e opcionalmente rodar finalize/deploy. 
 
 .NOTES 
   Requer: git instalado, node/npm, (opcional) vercel CLI no PATH, PowerShell 7+ recomendado. 
   Execute em um terminal com as permissões necessárias. 
 #> 
 
 param( 
   [switch]$SkipEnvPrompt,           # se passado, usa variáveis de ambiente existentes para gerar .env.local 
   [switch]$RunFinalizeScript,       # se passado, tenta executar ./scripts/finalize-build-and-deploy.ps1 
   [switch]$PromoteVercelDeploy      # se passado, tenta executar "vercel deploy --prebuilt --prod" 
 ) 
 
 function Write-Ok($msg){ Write-Host "[OK] $msg" -ForegroundColor Green } 
 function Write-Err($msg){ Write-Host "[ERR] $msg" -ForegroundColor Red } 
 function Confirm-YN($msg){ 
   $r = Read-Host "$msg (y/n)" 
   return $r -match '^(y|Y)' 
 } 
 
 # 1) Git: pull -> status -> branch -> last commit 
 Write-Host "1) Git: fetching latest from origin..." 
 git pull origin HEAD 2>&1 | Write-Host 
 if ($LASTEXITCODE -ne 0) { Write-Err "git pull retornou erro. Pare para revisar."; exit 1 } 
 Write-Host "Checking git status..." 
 git status --porcelain 
 git rev-parse --abbrev-ref HEAD 
 Write-Host "Último commit:" 
 git log -1 --pretty=format:"%H %an %ad %s" 
 
 Write-Ok "Git fetch/inspect concluído." 
 
 # 2) Prepare .env.local 
 $envFile = ".env.local" 
 $backupFile = ".env.local.bak.$((Get-Date).ToString('yyyyMMddHHmmss'))" 
 
 if (Test-Path $envFile) { 
   Write-Host "`nArquivo .env.local encontrado. Backing up -> $backupFile" 
   Copy-Item $envFile $backupFile -Force 
   Write-Ok "Backup criado." 
 } else { 
   Write-Host "`nArquivo .env.local não existe; será criado." 
 } 
 
 if (-not $SkipEnvPrompt) { 
   Write-Host "`nInsira os valores das seguintes variáveis (pressione Enter para deixar em branco):" 
   $supabaseUrl = Read-Host "VITE_SUPABASE_URL (ex: `https://xxx.supabase.co)` " 
   $supabaseAnon = Read-Host "VITE_SUPABASE_ANON_KEY" 
   $nextPublicAnon = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY (opcional)" 
   $serviceRole = Read-Host "SUPABASE_SERVICE_ROLE_KEY (opcional)" 
   $jwtSecret = Read-Host "SUPABASE_JWT_SECRET (opcional)" 
   $postgresUrl = Read-Host "POSTGRES_URL (opcional)" 
 } else { 
   Write-Host "SkipEnvPrompt ativado: lendo valores do ambiente..." 
   $supabaseUrl = $env:VITE_SUPABASE_URL 
   $supabaseAnon = $env:VITE_SUPABASE_ANON_KEY 
   $nextPublicAnon = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY 
   $serviceRole = $env:SUPABASE_SERVICE_ROLE_KEY 
   $jwtSecret = $env:SUPABASE_JWT_SECRET 
   $postgresUrl = $env:POSTGRES_URL 
 } 
 
 Write-Host "`nConteúdo que será escrito em $envFile:" 
 $preview = @() 
 if ($supabaseUrl) { $preview += "VITE_SUPABASE_URL=`"$supabaseUrl`"" } 
 if ($supabaseAnon) { $preview += "VITE_SUPABASE_ANON_KEY=`"$supabaseAnon`"" } 
 if ($nextPublicAnon) { $preview += "NEXT_PUBLIC_SUPABASE_ANON_KEY=`"$nextPublicAnon`"" } 
 if ($serviceRole) { $preview += "SUPABASE_SERVICE_ROLE_KEY=`"$serviceRole`"" } 
 if ($jwtSecret) { $preview += "SUPABASE_JWT_SECRET=`"$jwtSecret`"" } 
 if ($postgresUrl) { $preview += "POSTGRES_URL=`"$postgresUrl`"" } 
 
 $preview | ForEach-Object { Write-Host "  $_" } 
 
 if (-not (Confirm-YN "Prosseguir e sobrescrever $envFile com os valores acima?")) { 
   Write-Err "Operação cancelada pelo usuário. .env.local não alterado." 
 } else { 
   # Criar arquivo .env.local (mantém linhas em branco fora se variáveis vazias) 
   $content = $preview -join "`n" 
   Set-Content -Path $envFile -Value $content -Encoding UTF8 
   Write-Ok ".env.local atualizado." 
 } 
 
 # 3) Instalar dependências (npm ci preferível) 
 Write-Host "`n3) Instalando dependências (npm ci)..." 
 if (Test-Path "package-lock.json") { 
   npm ci 2>&1 | Write-Host 
   $code = $LASTEXITCODE 
 } else { 
   npm install 2>&1 | Write-Host 
   $code = $LASTEXITCODE 
 } 
 if ($code -ne 0) { 
   Write-Err "Instalação de dependências falhou (exit $code). Cole a saída e eu ajudo." 
   exit 1 
 } 
 Write-Ok "Dependências instaladas." 
 
 # 4) Lint / Typecheck / Build (executa somente se scripts existirem no package.json) 
 Write-Host "`n4) Rodando lint / typecheck / build se scripts existirem..." 
 # Ler package.json minimalmente 
 $pkg = $null 
 if (Test-Path "package.json") { 
   $pkg = Get-Content package.json -Raw | ConvertFrom-Json 
 } 
 if ($pkg -ne $null -and $pkg.scripts -ne $null) { 
   if ($pkg.scripts.lint) { 
     Write-Host "`nExecutando: npm run lint" 
     npm run lint 2>&1 | Write-Host 
     if ($LASTEXITCODE -ne 0) { Write-Err "Lint falhou."; exit 1 } 
     Write-Ok "Lint concluído." 
   } else { Write-Host "Script 'lint' não encontrado; pulando." } 
 
   if ($pkg.scripts.typecheck -or $pkg.scripts['type-check']) { 
     $tc = if ($pkg.scripts.typecheck) { 'typecheck' } else { 'type-check' } 
     Write-Host "`nExecutando: npm run $tc" 
     npm run $tc 2>&1 | Write-Host 
     if ($LASTEXITCODE -ne 0) { Write-Err "Typecheck falhou."; exit 1 } 
     Write-Ok "Typecheck concluído." 
   } else { 
     # fallback: se existir tsc no node_modules 
     if (Test-Path "node_modules/.bin/tsc") { 
       Write-Host "`nExecutando tsc --noEmit (fallback)" 
       .\node_modules\.bin\tsc --noEmit 2>&1 | Write-Host 
       if ($LASTEXITCODE -ne 0) { Write-Err "tsc falhou."; exit 1 } 
       Write-Ok "tsc concluído." 
     } else { 
       Write-Host "Nenhum typecheck detectado; pulando." 
     } 
   } 
 
   if ($pkg.scripts.build) { 
     Write-Host "`nExecutando: npm run build" 
     npm run build 2>&1 | Write-Host 
     if ($LASTEXITCODE -ne 0) { 
       Write-Err "Build falhou. Cole a saída para análise." 
       exit 1 
     } 
     Write-Ok "Build concluído." 
   } else { 
     Write-Host "Script 'build' não encontrado; pulando." 
   } 
 } else { 
   Write-Host "package.json não encontrado ou inválido; pulando lint/typecheck/build." 
 } 
 
 # 5) Opcional: executar finalize-build-and-deploy.ps1 
 
 if 
  ( 
 $RunFinalizeScript 
 ) { 
   
 $scriptPath 
  = 
 ".\scripts\finalize-build-and-deploy.ps1" 
 
   
 if 
  (Test-Path 
 $scriptPath 
 ) { 
     
 if 
  (Confirm-YN 
 "Executar 
 $scriptPath 
  agora?" 
 ) { 
       Write-Host 
 "Executando 
 $scriptPath 
 ..." 
 
       powershell -ExecutionPolicy Bypass -File 
 $scriptPath 
  
 2 
 >& 
 1 
  | Write-Host 
       
 if 
  ( 
 $LASTEXITCODE 
  -ne 
 0 
 ) { Write-Err 
 "O script finalize retornou erro ( 
 $LASTEXITCODE 
 )." 
  ; 
 exit 
  
 1 
  } 
       Write-Ok 
 "Script finalize executado." 
 
     } 
 else 
  { 
       Write-Host 
 "Pulado: 
 $scriptPath 
 " 
 
     } 
   } 
 else 
  { 
     Write-Err 
 "Arquivo 
 $scriptPath 
  não encontrado." 
 
   } 
 } 
 # 6) Opcional: Promover deploy com Vercel CLI 
 
 if 
  ( 
 $PromoteVercelDeploy 
 ) { 
   
 if 
  (-not (Get-Command vercel -ErrorAction SilentlyContinue)) { 
     Write-Err 
 "Vercel CLI não encontrado no PATH. Instale com 'npm i -g vercel' ou execute manualmente." 
 
     
 exit 
  
 1 
 
   } 
   
 if 
  (Confirm-YN 
 "Executar 'vercel deploy --prebuilt --prod' agora? (certifique-se de ter VERCL_TOKEN ou estar logado)" 
 ){ 
     Write-Host 
 "Rodando vercel deploy --prebuilt --prod ..." 
 
     vercel deploy --prebuilt --prod 
 2 
 >& 
 1 
  | Write-Host 
     
 if 
  ( 
 $LASTEXITCODE 
  -ne 
 0 
 ) { Write-Err 
 "vercel deploy falhou ( 
 $LASTEXITCODE 
 )." 
  ; 
 exit 
  
 1 
  } 
     Write-Ok 
 "vercel deploy concluído." 
 
   } 
 else 
  { 
     Write-Host 
 "Pulado deploy vercel." 
 
   } 
 } 
 Write-Host 
 "`nTodas etapas concluídas. Se algo falhou, revise as mensagens acima e cole a saída aqui para que eu ajude." 
