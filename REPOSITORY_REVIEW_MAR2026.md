# Revisão do repositório — março/2026

## Situação encontrada
- Repositório contém múltiplos artefatos de upload no root (`.zip`, `.xlsx`, `.csv`, logs).
- Existem workflows de múltiplas plataformas (Azure Static Web Apps, Vercel, Supabase, etc.) coexistindo.
- O workflow principal de CI referenciava `npm run check`, mas o script não existe no `package.json` atual.

## Correções aplicadas nesta revisão
1. Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) ajustado para não falhar quando `check` não existir.
2. [`.gitignore`](.gitignore) reforçado para impedir novos commits de artefatos binários e pastas legadas de plataforma.

## Arquivos pesados atualmente versionados (recomendado remover do `main`)
- `azuredev-f477-main.zip`
- `CT-e-20251114T200104Z-1-001.zip`
- `CTE E MANUTENÇÃO.zip`
- `demo-repository-main.zip`
- `files.zip`
- `optilog_packages.zip`
- `xyzlogicflow-main (1).zip`
- `manutencao planilha.xlsx`
- `manutencao planilha (1).xlsx - ago.csv`
- `Relatorio_jan a agosto.xls - Planilha1 (1).csv`

## Próximo passo recomendado no GitHub (sem perder histórico)
Criar branch `cleanup/repo-hygiene` e executar:

```bash
git checkout -b cleanup/repo-hygiene
git rm --cached "azuredev-f477-main.zip" "CT-e-20251114T200104Z-1-001.zip" "CTE E MANUTENÇÃO.zip" "demo-repository-main.zip" "files.zip" "optilog_packages.zip" "xyzlogicflow-main (1).zip" "manutencao planilha.xlsx" "manutencao planilha (1).xlsx - ago.csv" "Relatorio_jan a agosto.xls - Planilha1 (1).csv" "deploy.log"
git commit -m "chore: remove uploaded binary artifacts from main"
git push -u origin cleanup/repo-hygiene
```

Depois abrir PR e marcar como "cleanup estrutural".

## Observação de produção
Se a estratégia oficial for Azure App Service/Static Web Apps, mantenha apenas os workflows dessa trilha e desative/depreque os demais em PR separado para evitar deploy acidental em plataforma errada.
