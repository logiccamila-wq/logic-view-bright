# Deployment Guide

This guide explains how to deploy the Logic View Bright application to production.

## Architecture Overview

```
GitHub (Source) → Cloudflare Pages (Frontend) → xyzlogicflow.tech
                ↘ Supabase (Backend + Database)
```

- **Frontend**: Deployed on Cloudflare Pages with auto-deployment from GitHub main branch
- **Backend**: Supabase Edge Functions deployed manually via Supabase CLI
- **Database**: PostgreSQL hosted on Supabase
- **DNS**: Cloudflare manages domain (xyzlogicflow.tech)
- **Domain**: xyzlogicflow.tech points to Cloudflare Pages deployment

> **📖 For detailed Cloudflare Pages deployment instructions, see [CLOUDFLARE_PAGES_DEPLOYMENT.md](./CLOUDFLARE_PAGES_DEPLOYMENT.md)**

## Environment Variables

### Frontend (Cloudflare Pages)

Required environment variables for Cloudflare Pages deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbG...` |
| `VITE_APP_URL` | Your application URL | `https://xyzlogicflow.tech` |

**⚠️ SECURITY WARNING:** 
- **NEVER** add `SUPABASE_SERVICE_ROLE_KEY` to Cloudflare Pages
- **NEVER** add `SUPABASE_JWT_SECRET` to Cloudflare Pages
- Frontend environment variables are public - only use safe values
- Backend secrets must be configured in Supabase Edge Functions only

**How to set in Cloudflare Pages:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Select your project: `logic-view-bright`
4. Go to **Settings → Environment Variables**
5. Click **Add variable**
6. Set the **Variable name** and **Value**
7. Select environments: ✅ Production, ✅ Preview
8. Click **Save**
9. Redeploy the application

### Backend (Supabase Edge Functions)

Required environment variables for Supabase Edge Functions:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbG...` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `https://xyzlogicflow.tech,https://logic-view-bright.pages.dev` |

**⚠️ CRITICAL: ALLOWED_ORIGINS must include your Cloudflare Pages domain(s):**
- Production domain: `https://xyzlogicflow.tech`
- Cloudflare Pages domain: `https://logic-view-bright.pages.dev`
- Preview domains (optional): `https://*.logic-view-bright.pages.dev`

Example:
```
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.pages.dev
```

**Optional AI/Integration variables:**

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER_KEY` | API key for AI provider (e.g., OpenAI) |
| `AI_PROVIDER_MODEL` | AI model to use |
| `AI_PROVIDER_ENDPOINT` | AI provider endpoint URL |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) |

**How to set in Supabase:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → Edge Functions**
4. Under **Environment Variables**, click **Add Variable**
5. Set the **Name** and **Value**
6. Click **Save**

### ⚠️ Do NOT set these in Cloudflare Pages

The following variables should **NEVER** be set in Cloudflare Pages (frontend):
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (backend only)
- ❌ `SUPABASE_JWT_SECRET` (not needed)
- ❌ Any AI provider keys (backend only)
- ❌ Any other sensitive secrets

Cloudflare Pages is a frontend-only hosting platform. All environment variables set there are public and included in the client bundle.

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
   - Cloudflare Workers if applicable
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

### 1. Frontend Deployment (Cloudflare Pages)

Cloudflare Pages is configured for automatic deployment from GitHub.

**Automatic:**
```bash
git push origin main
```

Cloudflare Pages will automatically:
- Detect the push to main branch
- Run `npm install`
- Run `npm run build`
- Deploy the `dist` folder to production
- Update xyzlogicflow.tech (via custom domain)

**Manual Setup (First Time):**

If setting up Cloudflare Pages for the first time:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select repository: `logiccamila-wq/logic-view-bright`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite
   - **Node.js version**: 18 or 20
6. Set environment variables (see above)
7. Click **Save and Deploy**

For detailed instructions, see [CLOUDFLARE_PAGES_DEPLOYMENT.md](./CLOUDFLARE_PAGES_DEPLOYMENT.md)

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
# Automated approach (backend only, frontend auto-deploys)
./deploy.sh

# Or manual steps
npm run build                # Build frontend locally (optional, for testing)
git push origin main         # Push to GitHub (triggers Cloudflare Pages deploy)
npm run deploy:functions     # Deploy Edge Functions to Supabase
```

## Domain Configuration

### Cloudflare DNS and Pages Custom Domain

The domain `xyzlogicflow.tech` is managed by Cloudflare and should point to Cloudflare Pages:

**Method 1: Automatic (Recommended)**

If your domain is already in Cloudflare:
1. In Cloudflare Pages project settings, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter `xyzlogicflow.tech`
4. Cloudflare automatically configures DNS records
5. SSL certificate is provisioned automatically

**Method 2: Manual DNS Configuration**

If needed, verify/set these DNS records in Cloudflare:
1. **Cloudflare Dashboard** → DNS → Records
2. Add/verify CNAME record:
   - **Type**: `CNAME`
   - **Name**: `@` (or `xyzlogicflow.tech`)
   - **Target**: `logic-view-bright.pages.dev`
   - **Proxy status**: Proxied (orange cloud)
3. Optional: Add `www` subdomain:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `logic-view-bright.pages.dev`
   - **Proxy status**: Proxied

**SSL/TLS Settings:**
- Go to Cloudflare Dashboard → SSL/TLS
- Set encryption mode to **Full** or **Full (strict)**
- Cloudflare Pages automatically provides SSL certificates

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
- Check environment variables in Cloudflare Pages
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Redeploy after setting variables (Deployments → Retry deployment)

**Build failures:**
- Check Cloudflare Pages deployment logs (Pages → Deployments → View build)
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
   https://xyzlogicflow.tech,https://logic-view-bright.pages.dev,https://*.logic-view-bright.pages.dev
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

**Solution:** The backend `ALLOWED_ORIGINS` must include your Cloudflare Pages domain.

## Monitoring

- **Cloudflare Pages**: Deployment logs and analytics at https://dash.cloudflare.com
- **Cloudflare Analytics**: Web Analytics for traffic and performance
- **Supabase**: Database and function logs at https://supabase.com/dashboard

## Rollback

If deployment fails:

**Cloudflare Pages:**
1. Go to Pages → Deployments
2. Find the last working deployment
3. Click **...** → **Rollback to this deployment**
4. Confirm rollback

**Supabase Edge Functions:**
1. Revert code changes
2. Redeploy functions: `npm run deploy:functions`

## Support

For issues or questions:
- Check logs in Vercel and Supabase dashboards
- Review GitHub Actions workflow runs
- Consult [README_FINAL.md](./README_FINAL.md) for detailed system info

---

**Last Updated**: 2026-01-19  
**Maintained by**: Logic View Bright Team
