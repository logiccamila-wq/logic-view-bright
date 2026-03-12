# Logic View Bright - Azure

Sistema web de gestao logistica com frontend em React + TypeScript + Vite e trilha de deploy padronizada para Azure.

## Stack oficial

- Frontend: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- Hospedagem: Azure Static Web Apps
- API/Backend: Azure Functions (HTTP)
- Banco de dados: Azure Database (PostgreSQL ou SQL)
- IA: Azure OpenAI
- CI/CD: GitHub Actions com deploy Azure

## Desenvolvimento local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Build

```bash
npm run build:azure
```

O output de producao e gerado em `dist/`.

## Deploy

- Workflow principal: `.github/workflows/azure-static-web-apps.yml`
- Guia rapido: `AZURE_STATIC_WEB_APPS_DEPLOY.md`
- Config de rotas/cabecalhos: `staticwebapp.config.json`

## Variaveis de ambiente

Use `.env.example` como referencia unica para ambiente local e Azure.

## DNS e dominio oficial

Para a trilha Azure-first, o dominio `xyzlogicflow.com.br` deve apontar para os alvos oficiais do Azure usados pelo frontend/API. Registros legados de validacao ou apontamento para plataformas antigas devem ser removidos assim que nao forem mais necessarios.

Limpeza recomendada de legado:

- remover CNAMEs que apontem para `*.lovable.app`
- remover TXT de verificacao `_lovable.*`
- substituir apontamentos de `www` e `@` que ainda passem por CDN/hosting legado quando o dominio definitivo estiver publicado no Azure
- preservar somente registros de email que continuarem em uso real (MX, SPF, DKIM, DMARC)

## Observacao de migracao

Este repositorio contem componentes legados que ainda referenciam servicos antigos em partes especificas do codigo. A trilha oficial e a arquitetura Azure-only, e novos modulos devem seguir exclusivamente esse padrao.
