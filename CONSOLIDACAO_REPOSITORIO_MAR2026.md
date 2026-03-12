# Consolidação do repositório (mar/2026)

## O que aconteceu
Foram enviados arquivos de apoio diretamente no `main` (zips, planilhas e logs), misturando material de referência com código de produção.

## Objetivo desta consolidação
- Manter o `main` limpo para build/deploy.
- Preservar conteúdo de apoio fora do fluxo de produção.
- Evitar novo upload acidental de binários no root.

## Ações aplicadas nesta branch
1. `.gitignore` reforçado para bloquear:
   - `*.zip`, `*.7z`, `*.rar`
   - `*.xlsx`, `*.xls`, `*.csv`
   - arquivos temporários de editor/runtime como `*.swp`, `*.swo`, `*.pid`, `.dev_pid`
   - pastas legadas de tooling `.wrangler`, `.trae`
2. Remoção dos artefatos pesados versionados no root (somente da árvore do git, sem deletar histórico).

## Arquivos removidos do versionamento nesta limpeza
- `azuredev-f477-main.zip`
- `CT-e-20251114T200104Z-1-001.zip`
- `CTE E MANUTENÇÃO.zip`
- `demo-repository-main.zip`
- `files.zip`
- `logicflow-insight-87281dae-main (1).zip`
- `optilog_packages.zip`
- `xyzlogicflow-main (1).zip`
- `manutencao planilha.xlsx`
- `manutencao planilha (1).xlsx - ago.csv`
- `Relatorio_jan a agosto.xls - Planilha1 (1).csv`
- `deploy.log`

## Próximo passo recomendado
Abrir PR desta branch e fazer merge após revisão. Se precisar manter esses arquivos, mover para:
- `docs/support-artifacts/` (fora de build)
- ou um repositório separado de documentação/dados.
