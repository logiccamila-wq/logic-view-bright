# Deployment Guide

This guide explains how to deploy the Logic View Bright application to production.

## Architecture Overview

```
GitHub (Source) → Vercel (Frontend) → Cloudflare (DNS/CDN) → xyzlogicflow.tech
                ↘ Supabase (Backend + Database)
```

- **Frontend**: Deployed on Vercel with auto-deployment from GitHub main branch
- **Backend**: Supabase Edge Functions deployed manually via Supabase CLI
- **Database**: PostgreSQL hosted on Supabase
- **DNS/CDN**: Cloudflare manages domain (xyzlogicflow.tech) and CDN
- **Domain**: xyzlogicflow.tech points to Vercel deployment via Cloudflare

## Environment Variables

### Frontend (Vercel)

Required environment variables for Vercel deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbG...` |

**How to set in Vercel:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `logic-view-bright`
3. Navigate to **Settings → Environment Variables**
4. Click **Add New** for each variable
5. Set the **Name** and **Value**
6. Select environments: ✅ Production, ✅ Preview, ✅ Development
7. Click **Save**
8. Redeploy the application

### Backend (Supabase Edge Functions)

Required environment variables for Supabase Edge Functions:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbG...` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `https://xyzlogicflow.tech,https://logic-view-bright.vercel.app` |

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

### Cloudflare Workers (if used)

If deploying any workers to Cloudflare:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ALLOWED_ORIGINS` | Allowed CORS origins |

**How to set in Cloudflare:**

1. Go to Cloudflare Dashboard
2. Select your Worker
3. Navigate to **Settings → Variables**
4. Add environment variables as needed

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

### 1. Frontend Deployment (Vercel)

Vercel is configured for automatic deployment from GitHub.

**Automatic:**
```bash
git push origin main
```

Vercel will automatically:
- Detect the push to main branch
- Run `npm run build`
- Deploy to production
- Update xyzlogicflow.tech (via Cloudflare)

**Manual (if needed):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

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
# Automated script
./deploy.sh

# Or manual steps
npm run build              # Build frontend
git push origin main       # Deploy to Vercel
npm run deploy:functions   # Deploy Edge Functions
```

## Domain Configuration

### Cloudflare DNS Setup

The domain `xyzlogicflow.tech` is managed by Cloudflare and points to Vercel:

1. **Cloudflare Dashboard** → Domains → `xyzlogicflow.tech`
2. DNS records should include:
   - `CNAME` record: `@` → `cname.vercel-dns.com`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
3. Cloudflare acts as DNS and CDN
4. SSL/TLS mode: **Full** or **Full (strict)**

### Vercel Domain Configuration

1. Vercel Dashboard → Project → **Settings → Domains**
2. Add domain: `xyzlogicflow.tech`
3. Add domain: `www.xyzlogicflow.tech`
4. Vercel will provide DNS records to configure in Cloudflare

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
- Check environment variables in Vercel
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Redeploy after setting variables

**Build failures:**
- Check Vercel deployment logs
- Run `npm run build` locally to reproduce
- Fix TypeScript errors if any

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

1. Update `ALLOWED_ORIGINS` in Supabase Edge Functions
2. Include all frontend URLs:
   ```
   https://xyzlogicflow.tech,https://logic-view-bright.vercel.app,https://logic-view-bright-*.vercel.app
   ```
3. Redeploy affected Edge Functions

## Monitoring

- **Vercel**: Analytics and logs at https://vercel.com/dashboard
- **Supabase**: Database and function logs at https://supabase.com/dashboard
- **Cloudflare**: Analytics and security at https://dash.cloudflare.com

## Rollback

If deployment fails:

**Vercel:**
1. Go to Deployments in Vercel Dashboard
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

**Last Updated**: 2026-01-19  
**Maintained by**: Logic View Bright Team
