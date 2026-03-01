# Azure Static Web Apps – Deployment Guide

This document describes how to deploy this Vite + React + TypeScript project to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/).

## Build configuration

| Setting | Value |
|---|---|
| **app_location** | `/` |
| **api_location** | *(leave blank — no Azure Functions API)* |
| **output_location** | `dist` |
| **build command** | `npm ci && npm run build` |

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

The project pins Node.js via `.nvmrc`. Azure SWA honors this file automatically.  
To use the same version locally:

```bash
nvm use   # reads .nvmrc
```

## Routing

`staticwebapp.config.json` at the repository root configures Azure SWA to fall back to `/index.html` for all routes, enabling client-side navigation in the single-page app.

## Quick-start

```bash
# Install dependencies
npm ci

# Build production bundle
npm run build

# Preview locally (optional)
npx serve dist
```
