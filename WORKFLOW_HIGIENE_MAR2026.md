# Higienização de workflows (mar/2026)

## Objetivo
Manter apenas a trilha de produção escolhida (Azure) e remover deploys paralelos que geram conflito operacional.

## Alterações aplicadas
- Ajustado [`ci.yml`](.github/workflows/ci.yml) para não falhar quando o script `check` não existir.
- Removido workflow [`azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml).
- Removido workflow [`azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml).

## Resultado esperado
- Menos ruído no GitHub Actions.
- Menor risco de deploy em plataforma errada.
- Pipeline alinhado ao fluxo de produção em Azure.
