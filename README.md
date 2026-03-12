# Logic View Bright

Azure-native logistics and operations platform built with React, Vite, Node.js, PostgreSQL, and GitHub Actions.

## Project structure

- `src/` - React frontend
- `server/` - Node.js App Service entrypoint, API routes, and services
- `api/` - shared runtime handlers reused by the Node server
- `sql/migrations/` - SQL migrations for PostgreSQL
- `public/` - static assets
- `dist/` - production frontend build output

## Environment variables

Copy `.env.example` to your local environment file and set:

- `DATABASE_URL` - PostgreSQL connection string
- `AZURE_APPINSIGHTS_CONNECTION_STRING` - Azure Application Insights connection string
- `VITE_API_BASE_URL` - optional public base URL consumed by the frontend runtime client; when unset the app falls back to `/api`
- `VITE_APP_URL` - public URL of the deployed app
- `NODE_ENV` - use `production` for deployed environments

## Run locally

```bash
npm install
npm run check
npm run build
npm start
```

For frontend development only:

```bash
npm run dev
```

## Azure deployment

Production deployment is 100% Azure. The canonical automated path uses GitHub Actions to build the Vite frontend and Node runtime, then deploys the packaged app to Azure App Service with PostgreSQL and the shared runtime APIs under `/api/runtime/*`. Legacy alternatives such as Vercel and Netlify are not part of the supported deployment flow for this repository.

### Frontend
- Build output is generated in `dist/`
- `npm run build:azure` is available as the Azure-oriented build alias used by deployment documentation and currently maps to the same Vite production build as `npm run build`
- `staticwebapp.config.json` remains available only if you later split the frontend to Azure Static Web Apps

### Backend
- `server/index.js` is the App Service startup entrypoint
- `GET /api/health` provides a health check endpoint
- Runtime API routes are served under `/api/runtime/*`

### CI/CD
- GitHub Actions workflow: `.github/workflows/azure-deploy.yml`
- The workflow installs dependencies, type-checks, builds, and deploys to Azure App Service when `AZURE_CREDENTIALS` and `AZURE_WEBAPP_NAME` are configured in GitHub
- Runtime application settings should be configured in Azure App Service using the variables from `.env.example`

## Azure configuration

`azure.yaml` defines the Azure App Service packaging flow with:

- `npm install`
- `npm run build`
- `npm start`

## Verification

The repository is expected to work with:

```bash
npm install
npm run check
npm run build
npm start
```
