# Deployment

If you need to answer **"where is the Azure deployment or pipeline configured?"**, these are the main files to inspect:

## 1. CI/CD pipeline

File: `.github/workflows/azure-deploy.yml`

This is the main checked-in pipeline for the repository. It shows:

- when automation runs (`push` and `pull_request` on the `main` branch)
- the build job with `npm ci`, `npm run check`, and `npm run build`
- the deploy job for Azure App Service

Automatic deployment only runs on `push` to `main` when these GitHub settings exist:

- secret `AZURE_CREDENTIALS`
- variable `AZURE_WEBAPP_NAME`

## 2. Azure packaging and runtime config

File: `azure.yaml`

This file shows the packaging and startup flow configured in the repository:

- `npm install`
- `npm run build`
- `npm start`

## 3. Runtime files to inspect

- `server/index.js` - Node.js entrypoint when the app runs as a published server
- `api/runtime/index.js` - shared runtime/API handlers used by the Azure layer

## 4. Azure Static Web Apps

File: `AZURE_STATIC_WEB_APPS_DEPLOY.md`

This document shows the Azure Static Web Apps path for the frontend and explains the extra setup needed for that model.

## 5. Quick answer

If you only need to know **where to look**:

- GitHub pipeline: `.github/workflows/azure-deploy.yml`
- Azure app configuration: `azure.yaml`
- runtime/backend files: `api/runtime/index.js` and `server/index.js`
- Static Web Apps-specific guide: `AZURE_STATIC_WEB_APPS_DEPLOY.md`
