# Deployment Guide

This guide explains how to deploy the Logic View Bright application to production.

## Architecture Overview

The **recommended production stack** is **Vercel (frontend) + Supabase (backend/DB) + GitHub (CI/CD)**:

```
GitHub (Source) → Vercel (Frontend) → xyzlogicflow.tech
               ↘ Supabase (Backend + Database)
```

- **Frontend**: Vercel — auto-deployment from GitHub `main` branch
- **Backend**: Supabase Edge Functions deployed via Supabase CLI
- **Database**: PostgreSQL hosted on Supabase
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-vercel.yml`)
- **Domain**: xyzlogicflow.tech → Vercel

> **📖 For step-by-step Vercel setup, see [docs/deployment-guides/DEPLOY_SINGLE.md](./docs/deployment-guides/DEPLOY_SINGLE.md)**

> ⚠️ **Azure Static Web Apps** is a non-standard alternative. See [AZURE_STATIC_WEB_APPS_DEPLOY.md](./AZURE_STATIC_WEB_APPS_DEPLOY.md) for details, but it is **not the recommended path**.

## Environment Variables

Variables are split into two scopes: **client-side** (safe to expose) and **server-side** (must stay secret).

### Client-side (Vercel — `VITE_` prefix, public)

Set these in [Vercel Dashboard → Settings → Environment Variables](https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables).

| Variable | Description | Scope |
|----------|-------------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://xxx.supabase.co`) | Production · Preview · Development |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon/public** key | Production · Preview · Development |
| `VITE_APP_URL` | Public URL of the app (`https://xyzlogicflow.tech`) | Production |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | Production · Preview |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | Production · Preview |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | Production · Preview |
| `VITE_OPENROUTE_API_KEY` | OpenRouteService API key | Production · Preview |
| `VITE_TOMTOM_API_KEY` | TomTom API key | Production · Preview |

> **`VITE_SUPABASE_ANON_KEY`** is the same key as the *anon / publishable* key in the Supabase dashboard. It is safe to include in frontend bundles; Row-Level Security (RLS) policies protect the data.

**⚠️ SECURITY — NEVER add these to Vercel (or any frontend host):**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS, backend only
- ❌ `SUPABASE_JWT_SECRET` — backend only
- ❌ Any AI provider secret keys (`AI_PROVIDER_KEY`, `OPENAI_API_KEY`, etc.)

All `VITE_` variables are embedded in the client bundle and visible to end users.

**How to set in Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com/logiccamila-wq/logic-view-bright/settings/environment-variables)
2. Click **Add New**
3. Enter the **Name** and **Value**
4. Select the target environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**
6. Redeploy the application

### Server-side (Supabase Edge Functions — no `VITE_` prefix, secret)

Set these in [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard/project/_/settings/functions).

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service role** key — bypasses RLS, keep secret |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (e.g. `https://xyzlogicflow.tech`) |
| `AI_PROVIDER_KEY` | API key for the AI provider (e.g. OpenAI) |
| `AI_PROVIDER_MODEL` | AI model identifier |
| `AI_PROVIDER_ENDPOINT` | AI provider endpoint URL |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI directly) |

**⚠️ CRITICAL — `ALLOWED_ORIGINS` must include all frontend domains:**

```
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.vercel.app
```

**How to set in Supabase:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → Edge Functions**
4. Under **Environment Variables**, click **Add Variable**
5. Set the **Name** and **Value**
6. Click **Save**

## 🔒 Security Notice: Key Rotation Required

**IMPORTANT**: The Supabase keys in this repository were previously exposed in committed files. You **MUST** rotate these keys before going to production:

### How to Rotate Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Under **Project API keys**, click **Reset** for:
   - **anon/public key** (used in frontend)
   - **service_role key** (used in backend functions)
5. Copy the new keys
6. Update environment variables in:
   - Vercel (for `VITE_SUPABASE_ANON_KEY`)
   - Supabase Edge Functions (for `SUPABASE_SERVICE_ROLE_KEY`)
7. Redeploy frontend and backend

### Security Best Practices

- ✅ **NEVER** commit secrets to the repository
- ✅ Always use environment variables for sensitive data
- ✅ Rotate keys immediately if they are exposed
- ✅ Use different keys for development and production
- ✅ Restrict API key permissions to minimum required
- ✅ Monitor Supabase logs for unauthorized access
- ❌ **DO NOT** share service role keys publicly
- ❌ **DO NOT** use service role keys in frontend code

## Deployment Steps

### 1. Frontend Deployment (Vercel)

Vercel is configured for automatic deployment from GitHub.

**Automatic:**
```bash
git push origin main
```

Vercel will automatically:
- Detect the push to main branch
- Run `npm install && npm run build`
- Deploy the output to production
- Update xyzlogicflow.tech (via custom domain)

**Manual Setup (First Time):**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Add New… → Project**
3. Import repository: `logiccamila-wq/logic-view-bright`
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node.js version**: 18 or 20
5. Set environment variables (see above)
6. Click **Deploy**

For step-by-step instructions, see [docs/deployment-guides/DEPLOY_SINGLE.md](./docs/deployment-guides/DEPLOY_SINGLE.md)

### 2. Backend Deployment (Supabase Edge Functions)

Edge Functions must be deployed manually using Supabase CLI.

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (first time only)
supabase link --project-ref <your-project-ref>

# Deploy all functions
npm run deploy:functions

# Or deploy manually
supabase functions deploy --no-verify-jwt
```

### 3. Database Migrations

Apply database migrations when schema changes:

```bash
# Push migrations to Supabase
npm run db:push

# Or manually
supabase db push
```

### 4. Complete Deployment

For a complete deployment (frontend + backend):

```bash
# Automated approach (backend only, frontend auto-deploys via Vercel)
./deploy.sh

# Or manual steps
npm run build                # Build frontend locally (optional, for testing)
git push origin main         # Push to GitHub (triggers Vercel deploy)
npm run deploy:functions     # Deploy Edge Functions to Supabase
```

## Domain Configuration

### Custom Domain on Vercel

The domain `xyzlogicflow.tech` should point to Vercel:

1. In [Vercel Dashboard](https://vercel.com/logiccamila-wq/logic-view-bright/settings/domains), click **Add Domain**
2. Enter `xyzlogicflow.tech` (and `www.xyzlogicflow.tech`)
3. Follow the DNS instructions shown by Vercel (CNAME or A record)
4. SSL certificate is provisioned automatically

## Verification

After deployment, verify:

1. ✅ Frontend is accessible at https://xyzlogicflow.tech
2. ✅ Environment variables are set correctly (no console errors)
3. ✅ Login works with test credentials
4. ✅ Supabase connection is active
5. ✅ Edge Functions are responding
6. ✅ No security warnings in browser console

### Health Check

Run the validation script:

```bash
node scripts/validate-system.cjs
```

Or manually test:

1. Visit https://xyzlogicflow.tech
2. Open browser console (F12)
3. Check for errors (should see none)
4. Try logging in with valid credentials
5. Navigate to different modules
6. Verify data loads correctly

## Troubleshooting

### Frontend Issues

**Blank page / White screen:**
- Check environment variables in Vercel Dashboard
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Redeploy after setting variables (Deployments → Redeploy)

**Build failures:**
- Check Vercel deployment logs (Deployments → View build)
- Run `npm run build` locally to reproduce
- Fix TypeScript errors if any
- Ensure all dependencies are in `package.json`

### Backend Issues

**Edge Functions not responding:**
- Check Supabase function logs
- Verify environment variables in Supabase Dashboard
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check CORS configuration (`ALLOWED_ORIGINS`)

**Database connection errors:**
- Verify database is running (Supabase Dashboard)
- Check connection string
- Review database logs

### CORS Errors

If you see CORS errors in browser console:

1. Update `ALLOWED_ORIGINS` in Supabase Edge Functions environment variables
2. Include all frontend URLs:
   ```
   https://xyzlogicflow.tech,https://logic-view-bright.vercel.app
   ```
3. Redeploy affected Edge Functions:
   ```bash
   npm run deploy:functions
   ```

**Common CORS error messages:**
```
Access to fetch at 'https://xxxxx.supabase.co/...' from origin 'https://xyzlogicflow.tech'
has been blocked by CORS policy
```

**Solution:** The backend `ALLOWED_ORIGINS` must include your Vercel deployment domain.

## Monitoring

- **Vercel**: Deployment logs and analytics at https://vercel.com/logiccamila-wq/logic-view-bright
- **Supabase**: Database and function logs at https://supabase.com/dashboard

## Rollback

If deployment fails:

**Vercel:**
1. Go to [Vercel Deployments](https://vercel.com/logiccamila-wq/logic-view-bright/deployments)
2. Find the last working deployment
3. Click **...** → **Promote to Production**

**Supabase Edge Functions:**
1. Revert code changes
2. Redeploy functions: `npm run deploy:functions`

## Support

For issues or questions:
- Check logs in Vercel and Supabase dashboards
- Review GitHub Actions workflow runs
- Consult [README_FINAL.md](./README_FINAL.md) for detailed system info

---

**Last Updated**: 2026-03-01  
**Maintained by**: Logic View Bright Team
