# Deployment Guide (Azure-only)

Este projeto usa Azure como caminho oficial de producao.

## Arquitetura

```text
GitHub (source) -> Azure Static Web Apps (frontend)
                -> Azure Functions (API)
                -> Azure Database (dados)
                -> Azure OpenAI (IA)
```

## 1. Frontend (Azure Static Web Apps)

1. Crie o recurso de Static Web App no Azure Portal.
2. Copie o deployment token em Settings -> Deployment token.
3. Configure no GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
4. Garanta que o workflow `.github/workflows/azure-static-web-apps.yml` esteja ativo.

## 2. Variaveis no Azure

Configure em Azure Static Web Apps (Application settings):

- `VITE_APP_URL`
- `VITE_API_BASE_URL`
- `VITE_EMAILJS_SERVICE_ID` (opcional)
- `VITE_EMAILJS_TEMPLATE_ID` (opcional)
- `VITE_EMAILJS_PUBLIC_KEY` (opcional)
- `VITE_OPENROUTE_API_KEY` (opcional)
- `VITE_TOMTOM_API_KEY` (opcional)

Configure no backend Azure (Functions/App Service/Container Apps):

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_POSTGRES_HOST`
- `AZURE_POSTGRES_PORT`
- `AZURE_POSTGRES_DB`
- `AZURE_POSTGRES_USER`
- `AZURE_POSTGRES_PASSWORD`
- `ALLOWED_ORIGINS`

## 3. Build e validacao local

```bash
npm ci
npm run build:azure
npm run preview
```

## 4. Go-live

1. Push na branch `main`.
2. Acompanhe o job `Azure Static Web Apps CI/CD` no GitHub Actions.
3. Valide rotas SPA e APIs configuradas em `VITE_API_BASE_URL`.
4. Valide cabecalhos/rewrites em `staticwebapp.config.json`.
