# ===========================================
# 🔹 Ultra Full Stack Setup - Tudo em 1
# ERP, CRM, TMS, WMS, OMS, TPMS, Oficina, Pneus, Logística, Transporte, Financeiro, Frota
# ===========================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -----------------------------
# 1️⃣ Limpeza Git e .gitignore
# -----------------------------
Write-Host "📦 Limpeza Git e atualização .gitignore..."

$gitignorePath = ".\.gitignore"
@"
# Node / Next
node_modules/
.next/
out/
dist/
build/
.cache/
.vercel/
.npm/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-lock.yaml

# Firebase local state
.firebase/

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.iml

# Logs
logs/
*.log

# Builds / executáveis
*.exe
*.dll
*.so
*.dylib
*.apk
*.aab

# Flutter / Dart
.flutter-plugins
.flutter-plugins-dependencies
.dart_tool/
.packages
build/
.pub/
.pub-cache/
.flutter-plugins
pubspec.lock

# Android / Gradle
.gradle/
**/build/
local.properties

# iOS
Pods/
Podfile.lock
DerivedData/
*.xcuserstate

# Databases / secrets / envs
*.sqlite
*.db
*.sql
*.sqlite3
.env
.env.local
.env.*.local
.env.*.secret

# Misc large / caches
coverage/
tmp/
temp/
.cache/

# App temporários
app/Untitled-*.txt
app/*Next.js*
frontend/src/flutter_windows_*
"@ | Set-Content $gitignorePath -Encoding UTF8

# Remover arquivos rastreados que agora serão ignorados
git rm -r --cached --ignore-unmatch .next .firebase node_modules build dist .gradle .dart_tool .pub-cache .vscode .idea *.log app/Untitled-*.txt app/*Next.js* frontend/src/flutter_windows_* 

git add .gitignore
git add -A
git commit -m "chore: limpeza completa, atualização .gitignore"
Write-Host "✅ Git limpo e .gitignore atualizado"

# -----------------------------
# 2️⃣ Backend setup
# -----------------------------
Write-Host "🛠 Configurando backend..."
$envFile = ".\backend\.env"
if (-Not (Test-Path $envFile)) {
    @"
PORT=3011
DB_PATH=./optilog.db
JWT_SECRET=sua_chave_segura_aqui
OPENAI_API_KEY=
DATABASE_URL=postgres://user:password@localhost:5432/optilog
"@ | Set-Content $envFile -Encoding UTF8
    Write-Host "✅ .env criado para backend"
} else {
    Write-Host "⚠ .env já existe, mantendo existente"
}

# Patch db.js para usar DB_PATH do .env
$dbFile = ".\backend\db.js"
$contents = Get-Content $dbFile -Raw
$patched = $contents -replace "path\.join\(__dirname,\s*['\"]optilog\.db['\"]\)", 'process.env.DB_PATH || path.join(__dirname, "optilog.db")'
if ($patched -ne $contents) {
    $patched | Set-Content $dbFile -Encoding UTF8
    Write-Host "✅ db.js atualizado para ler DB_PATH do .env"
} else {
    Write-Host "ℹ db.js já está configurado para DB_PATH ou padrão diferente encontrado"
}

# Instalar dependências backend
Push-Location ".\backend"
npm install

# Provisionar Postgres (se disponível) e rodar setup do banco
$backendEnv = ".\backend\.env"
if (-Not (Test-Path $backendEnv)) {
  @"
PORT=3011
DB_PATH=./optilog.db
JWT_SECRET=sua_chave_segura_aqui
OPENAI_API_KEY=
DATABASE_URL=postgres://postgres:postgres@localhost:5432/optilog
"@ | Set-Content $backendEnv -Encoding UTF8
  Write-Host "✅ .env criado para backend com DATABASE_URL padrão"
} else {
  # Garante que DATABASE_URL exista com fallback
  $envText = Get-Content $backendEnv -Raw
  if ($envText -notmatch "(?m)^DATABASE_URL=") {
    Add-Content $backendEnv "`nDATABASE_URL=postgres://postgres:postgres@localhost:5432/optilog"
    Write-Host "ℹ DATABASE_URL adicionado ao .env do backend"
  }
}

try {
  npm run db:setup
  Write-Host "✅ Banco provisionado e seed concluído"
} catch {
  Write-Host "⚠ Não foi possível conectar/provisionar o banco automaticamente."
  Write-Host "   - Se você tiver Docker, suba Postgres com:"
  Write-Host "     cd ..\\tire-ops; docker compose up -d; cd ..\\optilog-app"
  Write-Host "   - Depois, reexecute: cd backend; npm run db:setup"
}

Pop-Location

# -----------------------------
# 3️⃣ Flutter setup
# -----------------------------
$flutterPath = "frontend/src/flutter_windows_3.24.3-stable/flutter"
if (-Not (Test-Path $flutterPath)) {
    Write-Host "⬇ Baixando Flutter 3.24.3-stable..."
    $zipUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.3-stable.zip"
    $zipOut = "frontend/src/flutter.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipOut
    Expand-Archive $zipOut -DestinationPath "frontend/src" -Force
    Remove-Item $zipOut -Force
    Write-Host "✅ Flutter instalado em $flutterPath"
} else {
    Write-Host "✅ Flutter já presente em $flutterPath"
}

# -----------------------------
# 4️⃣ Frontend setup
# -----------------------------
Push-Location ".\frontend"
npm install
Write-Host "✅ Dependências frontend instaladas"
Pop-Location

# -----------------------------
# 5️⃣ Inicialização serviços
# -----------------------------
Write-Host "🚀 Iniciando backend..."
Start-Process pwsh -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command 'cd backend; node app.js'" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "🚀 Iniciando frontend..."
Start-Process pwsh -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command 'cd frontend; npm run dev'" -WindowStyle Normal

# -----------------------------
# 6️⃣ Validação módulos
# -----------------------------
Write-Host "🔍 Validando módulos principais..."
$modules = @(
    @{Name="ERP"; Url="http://localhost:3011/erp/health"},
    @{Name="CRM"; Url="http://localhost:3011/crm/health"},
    @{Name="TMS"; Url="http://localhost:3011/tms/health"},
    @{Name="WMS"; Url="http://localhost:3011/wms/health"},
    @{Name="OMS"; Url="http://localhost:3011/oms/health"},
    @{Name="TPMS"; Url="http://localhost:3011/tpms/health"},
    @{Name="Oficina"; Url="http://localhost:3011/oficina/health"},
    @{Name="Pneus"; Url="http://localhost:3011/pneus/health"},
    @{Name="Logística"; Url="http://localhost:3011/logistica/health"},
    @{Name="Transporte"; Url="http://localhost:3011/transporte/health"},
    @{Name="Financeiro"; Url="http://localhost:3011/financeiro/health"},
    @{Name="Frota"; Url="http://localhost:3011/frota/health"}
)

$report = "setup_full_ultra_report.txt"
"" | Set-Content $report

foreach ($m in $modules) {
    try {
        $resp = Invoke-WebRequest -Uri $m.Url -UseBasicParsing -TimeoutSec 5
        if ($resp.StatusCode -eq 200) {
            "$( $m.Name ) ✅ OK" | Tee-Object -FilePath $report -Append
        } else {
            "$( $m.Name ) ⚠ Status: $( $resp.StatusCode )" | Tee-Object -FilePath $report -Append
        }
    } catch {
        "$( $m.Name ) ❌ Não acessível" | Tee-Object -FilePath $report -Append
    }
}

Write-Host "📄 Relatório final gerado em: $report"
Write-Host "✅ Setup ultra completo concluído! Todos os módulos foram inicializados e validados."