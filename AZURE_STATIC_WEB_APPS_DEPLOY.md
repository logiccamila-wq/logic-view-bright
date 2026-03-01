# Azure Static Web Apps – Deployment Guide

This document describes how to deploy this Vite + React + TypeScript project to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/).

## Build configuration

| Setting | Value |
|---|---|
| **app_location** | `/` |
| **api_location** | *(leave blank — no Azure Functions API)* |
| **output_location** | `dist` |
| **build command** | `npm ci && npm run build:azure` |

## GitHub Actions Workflow

A GitHub Actions workflow has been configured at `.github/workflows/azure-static-web-apps.yml` for automatic deployment to Azure Static Web Apps.

### Prerequisites

Before the workflow can deploy, you need to:

1. **Create an Azure Static Web App** in the Azure Portal
2. **Get the deployment token** from Azure Portal:
   - Go to your Static Web App resource
   - Navigate to **Settings → Deployment token**
   - Copy the token
3. **Add the secret to GitHub**:
   - Go to your GitHub repository
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Paste the deployment token

### Workflow Triggers

The workflow automatically runs on:
- Push to `main` branch (production deployment)
- Pull requests to `main` branch (preview deployment)

## Environment variables

Copy `.env.example` to `.env.local` (gitignored) and fill in the values before running a local build.

For Azure SWA, add the following variables in the portal under **Configuration → Application settings**:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |
| `VITE_APP_URL` | The public URL of the deployed app |

> **Never commit real secrets.** The `.env` and `.env.*` files (except `.env.example`) are gitignored.

## Node.js version

The project pins Node.js via `.nvmrc` (currently `20.19.5`). Azure SWA honors this file automatically.  
To use the same version locally:

```bash
nvm use   # reads .nvmrc
```

## Routing

`staticwebapp.config.json` at the repository root configures Azure SWA:
- Falls back to `/index.html` for all routes (SPA support)
- Excludes static assets, API routes, and Next.js internals from fallback
- Sets security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Overrides 404 responses to return the SPA index

## Security Headers

The following security headers are configured in `staticwebapp.config.json`:

| Header | Value |
|---|---|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | Restricted features |

## Build Scripts

The project includes multiple build scripts for different deployment targets:

| Script | Description |
|---|---|
| `npm run build` | Next.js production build (for Vercel) |
| `npm run build:vite` | Vite production build |
| `npm run build:azure` | Vite build with `dist` output for Azure SWA |
| `npm run dev:vite` | Vite development server |
| `npm run preview` | Vite preview server |

## Quick-start

```bash
# Install dependencies
npm ci

# Build production bundle for Azure
npm run build:azure

# Preview locally (optional)
npm run preview
```

## Troubleshooting

### Build Fails
- Ensure Node.js 20.x is installed
- Clear `dist` folder and rebuild: `rm -rf dist && npm run build:azure`

### Deployment Token Issues
- Regenerate the token in Azure Portal
- Update the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub

### Routing Issues
- Verify `staticwebapp.config.json` is in the repository root
- Check that `navigationFallback` is correctly configured

### Environment Variables
- Set required environment variables in Azure SWA Configuration
- For local development, copy `.env.example` to `.env.local`
