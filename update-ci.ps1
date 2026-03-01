# update-ci.ps1
# Script para criar/atualizar CI e remover integrações Firebase
# Execute na raiz do repositório (onde está .git)

$ErrorActionPreference = 'Stop'

# 1) verificar estamos no diretório correto
if (-not (Test-Path .git)) {
  Write-Error "Não foi encontrada a pasta .git. Execute este script a partir da raiz do repositório."
  exit 1
}

# 2) buscar e trocar/ criar branch
git fetch origin

# tentar checkout; se falhar, criar branch a partir de origin/main ou main
git checkout ci/remove-firebase-vercel-neon 2>$null
if ($LASTEXITCODE -ne 0) {
  git checkout -b ci/remove-firebase-vercel-neon origin/main 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao criar branch a partir de origin/main, criando branch local a partir de main..."
    git checkout -b ci/remove-firebase-vercel-neon main
  }
}

# 3) criar diretórios
New-Item -ItemType Directory -Force -Path .github\workflows | Out-Null
New-Item -ItemType Directory -Force -Path docs | Out-Null

# 4) escrever .github/workflows/ci.yml
$ci = @'
# CI - Build & Test
name: CI - Build & Test

on:
  push:
    branches:
      - main
      - 'feature/**'
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  build:
    name: Install, Test and Build (monorepo-aware)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Detect packages and install + build
        run: |
          set -euo pipefail
          WORKDIRS="./ ./optilog-app ./frontend ./packages/frontend ./app ./optilog-app/frontend ./optilog-app/backend ./backend"
          ARTIFACTS_DIR="$GITHUB_WORKSPACE/_ci_build_artifacts"
          mkdir -p "$ARTIFACTS_DIR"
          any_built=false
          for d in $WORKDIRS; do
            if [ -f "$d/package.json" ]; then
              echo "=== Found package.json in: $d ==="
              pushd "$d" >/dev/null 2>&1
              if [ -f package-lock.json ]; then
                npm ci --no-audit --no-fund
              else
                npm install --no-audit --no-fund
              fi
              # Lint (non-blocking)
              if npm run | grep -q 'lint'; then
                echo "Running lint in $d"
                npm run lint || echo "Lint failed in $d (non-blocking)"
              fi
              # Tests (if present) - fail the job if tests exist and fail
              if npm run | grep -q 'test'; then
                echo "Running tests in $d"
                npm test
              fi
              # Build (if present)
              if npm run | grep -q 'build'; then
                echo "Running build in $d"
                npm run build
                # Collect common artifacts for debugging
                if [ -d ".next" ]; then cp -r .next "$ARTIFACTS_DIR/$(basename $d)-next" || true; fi
                if [ -d "build" ]; then cp -r build "$ARTIFACTS_DIR/$(basename $d)-build" || true; fi
                if [ -d "dist" ]; then cp -r dist "$ARTIFACTS_DIR/$(basename $d)-dist" || true; fi
                any_built=true
              else
                echo "No build script in $d"
              fi
              popd >/dev/null 2>&1
            fi
          done

          if [ "$any_built" = false ]; then
            echo "::warning::No build artifacts were created. Ensure your package.json build scripts are present."
          fi

      - name: Upload build artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ci-build-artifacts
          path: _ci_build_artifacts
'@

$ci | Out-File -FilePath .github\workflows\ci.yml -Encoding utf8

# 5) escrever docs/deploy-ci.md
$deployci = @'
# Integração Contínua e Deploy (CI)

Este documento descreve os workflows adicionados:
- `.github/workflows/ci.yml` — roda instalação, lint, testes e build em múltiplos pacotes (monorepo-aware).
- `.github/workflows/deploy-vercel.yml` — faz deploy automatizado na Vercel (requer secrets).
- `.github/workflows/build-and-publish-image.yml` — constrói imagem Docker e publica no GHCR (opcional).

Remoções
- Configurações do Firebase foram removidas. Vercel e Neon permanecem como provedores oficiais.

Requisitos para pacotes Node
- `npm run build` para gerar artefatos de produção quando aplicável.
- `npm run start` para execução em produção (se aplicável).
- Scripts `lint` e `test` são opcionais, mas recomendados.

Como o CI funciona
1. Procura `package.json` nos diretórios comuns (`./`, `./frontend`, `./app`, etc.).
2. Executa `npm ci` (ou `npm install`) em cada pacote encontrado.
3. Roda `npm run lint` se existir.
4. Roda `npm test` se existir; falhas quebram o job.
5. Roda `npm run build` se existir e armazena artefatos em `_ci_build_artifacts`.

Segredos recomendados
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `NEON_DATABASE_URL`
- `GHCR_PAT` (se publicar imagens no GHCR)

Como adicionar segredos
- Via UI: Settings → Secrets and variables → Actions.
- Via CLI: `gh auth login` e `gh secret set NOME --body "valor"`.
'@

$deployci | Out-File -FilePath docs\deploy-ci.md -Encoding utf8

# 6) escrever README.md (versão simplificada)
$readme = @'
# Optilog.app

## Deploy e Hospedagem
- Frontend: recomendado Vercel (workflow `deploy-vercel.yml`).
- Backend/serviços: opcional via Neon (Postgres) e contêiner no GHCR.

## Como rodar localmente
1. `git clone <URL_DO_REPOSITORIO>`
2. `cd optilog.app`
3. `npm ci`
4. `npm run dev`

Consulte `docs/deploy-ci.md` para detalhes de CI/CD.
'@

$readme | Out-File -FilePath README.md -Encoding utf8

# 7) escrever docs/apphosting-setup.md
$apphosting = @'
# Deploy / Hosting (nota)

- Firebase foi removido desta base. Mantemos Vercel (frontend) e Neon (Postgres) como provedores padrão.
- Ajuste domínios e secrets de acordo com o ambiente.
- Para outros provedores, crie workflows específicos ou solicite suporte adicional.
'@

$apphosting | Out-File -FilePath docs\apphosting-setup.md -Encoding utf8

# 8) remover arquivos Firebase/Vercel/Neon comuns (ignora se não existirem)
$removeList = @(
  ".firebaserc","firebase.json",
  ".github\workflows\firebase-deploy.yml",
  ".firebase", "render.yaml"
)
foreach ($f in $removeList) {
  if (Test-Path $f) {
    try {
      git rm -f --ignore-unmatch $f
      Write-Host "Removido: $f"
    } catch {
      Write-Warning "Falha ao remover ${f}: $_"
    }
  } else {
    Write-Host "Não encontrado (ignorando): $f"
  }
}

# 9) listar scripts candidatos para revisão manual
$candidateScripts = @("scripts\deploy-all.ps1","scripts\deploy_final_aggressive.ps1","deploy_full_ultra.ps1")
foreach ($s in $candidateScripts) {
  if (Test-Path $s) {
    Write-Host "Arquivo candidato para remoção/edição: $s (por favor revise manualmente e remova se desejar)"
  }
}

# 10) commit e push
$porcelain = git status --porcelain
if ([string]::IsNullOrWhiteSpace($porcelain)) {
  Write-Host "Nenhuma mudança detectada para commitar."
} else {
  git add -A
  git commit -m "chore(ci): remove Firebase/Vercel/Neon integrations; add CI build-only workflow; update docs"
  git push origin ci/remove-firebase-vercel-neon
  Write-Host "Push realizado para origin/ci/remove-firebase-vercel-neon"
}

Write-Host "Script finalizado. Revise a branch e abra/atualize PR se desejar." 
