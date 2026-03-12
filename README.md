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
- `NODE_ENV` - use `production` for deployed environments

## Run locally

```bash
npm install
npm run build
npm start
```

For frontend development only:

```bash
npm run dev
```

## Azure deployment

### Frontend
- Build output is generated in `dist/`
- Static Web Apps routing is configured in `staticwebapp.config.json`

### Backend
- `server/index.js` is the App Service startup entrypoint
- `GET /api/health` provides a health check endpoint
- Runtime API routes are served under `/api/runtime/*`

### CI/CD
- GitHub Actions workflow: `.github/workflows/azure-deploy.yml`
- The workflow installs dependencies, type-checks, builds, and deploys to Azure App Service when Azure secrets are configured

## Azure configuration

`azure.yaml` defines the Azure App Service packaging flow with:

- `npm install`
- `npm run build`
- `npm start`

## Verification

The repository is expected to work with:

```bash
npm install
npm run build
npm start
```
