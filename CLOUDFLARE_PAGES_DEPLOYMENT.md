# Cloudflare Pages Deployment Guide

This guide explains how to deploy the Logic View Bright frontend to Cloudflare Pages.

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

## Prerequisites

- GitHub account with access to the repository
- Cloudflare account
- Domain registered in Cloudflare (xyzlogicflow.tech)
- Supabase project with URL and anonymous key

## Cloudflare Pages Setup

### 1. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project**
4. Select **Connect to Git**
5. Choose **GitHub** and authorize Cloudflare
6. Select repository: `logiccamila-wq/logic-view-bright`
7. Configure build settings:

**Build Configuration:**

| Setting | Value |
|---------|-------|
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (leave empty) |
| **Node.js version** | `18` or `20` (default is fine) |

8. Click **Save and Deploy**

### 2. Configure Environment Variables

**⚠️ IMPORTANT SECURITY NOTES:**
- **ONLY** set public/frontend environment variables in Cloudflare Pages
- **NEVER** add `SUPABASE_SERVICE_ROLE_KEY` or other secrets to Cloudflare Pages
- Backend secrets must be configured in Supabase Edge Functions, not in the frontend

#### Required Frontend Environment Variables

Set these in Cloudflare Dashboard → Pages → Settings → Environment Variables:

| Variable Name | Description | Example Value | Required |
|--------------|-------------|---------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key (safe for frontend) | `eyJhbGci...` | ✅ Yes |
| `VITE_APP_URL` | Your application URL | `https://xyzlogicflow.tech` | ⚠️ Recommended |

#### How to Set Environment Variables in Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Select your Pages project: `logic-view-bright`
4. Go to **Settings** → **Environment Variables**
5. Click **Add variable**
6. Enter **Variable name** and **Value**
7. Select environment:
   - ✅ **Production** (required)
   - ✅ **Preview** (recommended for testing)
8. Click **Save**
9. Repeat for each variable
10. **Redeploy** the project after adding variables

### 3. Configure Custom Domain

1. In Cloudflare Pages project settings, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `xyzlogicflow.tech`
4. Cloudflare will automatically configure DNS records (since domain is in Cloudflare)
5. Optionally add `www.xyzlogicflow.tech` as well
6. Wait for SSL certificate to be provisioned (usually 1-5 minutes)

## Backend Configuration (Supabase)

### Required Environment Variables for Supabase Edge Functions

Configure these in Supabase Dashboard → Settings → Edge Functions:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `eyJhbGci...` |
| `ALLOWED_ORIGINS` | **Comma-separated** list of allowed CORS origins | `https://xyzlogicflow.tech,https://logic-view-bright.pages.dev` |

**⚠️ CRITICAL: ALLOWED_ORIGINS Configuration**

The `ALLOWED_ORIGINS` environment variable **MUST** include:
1. Your production domain: `https://xyzlogicflow.tech`
2. Your Cloudflare Pages domain: `https://logic-view-bright.pages.dev`
3. Any preview/branch URLs if needed (see security note below)

Example (minimal, recommended for production):
```
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.pages.dev
```

Example (including preview branches):
```
ALLOWED_ORIGINS=https://xyzlogicflow.tech,https://logic-view-bright.pages.dev,https://dev.logic-view-bright.pages.dev,https://staging.logic-view-bright.pages.dev
```

**⚠️ Security Note on Wildcards:**
While you can use `https://*.logic-view-bright.pages.dev` to allow all preview deployments, this is overly permissive. For production environments, it's more secure to:
- List only specific preview domains you need (e.g., `dev`, `staging`)
- Avoid wildcards that would allow any subdomain
- Review and update ALLOWED_ORIGINS as needed rather than using a catch-all pattern

**Why this is important:**
- Edge Functions validate the origin of requests for security
- Without proper CORS configuration, API calls will fail
- Frontend will show CORS errors in the browser console
- Too-permissive CORS settings can expose your API to unauthorized domains

### How to Set Supabase Environment Variables

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Under **Environment Variables**, click **Add Variable**
5. Set **Name**: `ALLOWED_ORIGINS`
6. Set **Value**: `https://xyzlogicflow.tech,https://logic-view-bright.pages.dev`
7. Click **Save**
8. **Redeploy affected Edge Functions** (see deployment section below)

## Deployment Workflow

### Automatic Deployment (Recommended)

Cloudflare Pages automatically deploys when you push to GitHub:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

Cloudflare Pages will automatically:
1. Detect the push to main branch
2. Clone the repository
3. Run `npm install`
4. Run `npm run build`
5. Deploy the `dist` folder to production
6. Update your custom domain (xyzlogicflow.tech)

### Manual Deployment (if needed)

You can also deploy manually:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Deployments**
3. Click **Create deployment**
4. Upload the `dist` folder (after running `npm run build` locally)

### Deploy Supabase Edge Functions

Edge Functions must be deployed manually using Supabase CLI:

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

### Complete Deployment Checklist

Use this checklist for a complete deployment:

- [ ] **Frontend (Cloudflare Pages)**
  - [ ] Environment variables set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - [ ] Custom domain configured (xyzlogicflow.tech)
  - [ ] SSL certificate active
  - [ ] Latest code pushed to main branch
  - [ ] Deployment successful (check Deployments tab)

- [ ] **Backend (Supabase)**
  - [ ] `ALLOWED_ORIGINS` includes Cloudflare Pages domain
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` configured
  - [ ] Edge Functions deployed
  - [ ] Database migrations applied (`npm run db:push`)

- [ ] **Verification**
  - [ ] Site accessible at https://xyzlogicflow.tech
  - [ ] No console errors in browser
  - [ ] Login works with test credentials
  - [ ] API calls succeed (check Network tab)
  - [ ] No CORS errors

## Verification

After deployment, verify everything works:

1. ✅ Visit https://xyzlogicflow.tech
2. ✅ Open browser console (F12) - check for errors
3. ✅ Try logging in with valid credentials
4. ✅ Navigate to different modules
5. ✅ Verify data loads correctly
6. ✅ Check Network tab for successful API calls

### Health Check Script

Run the validation script:

```bash
node scripts/validate-system.cjs
```

## Troubleshooting

### Blank Page / White Screen

**Cause:** Environment variables not configured in Cloudflare Pages

**Solution:**
1. Go to Cloudflare Pages → Settings → Environment Variables
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy the project (Deployments → Retry deployment)

### Build Failures

**Check build logs:**
1. Go to Cloudflare Pages → Deployments
2. Click on the failed deployment
3. Review build logs for errors

**Common issues:**
- Missing dependencies: Ensure `package.json` and `package-lock.json` are committed
- TypeScript errors: Run `npm run build` locally to reproduce
- Out of memory: Cloudflare Pages has generous limits, but check build output

### CORS Errors

**Symptom:** Browser console shows errors like:
```
Access to fetch at 'https://xxxxx.supabase.co/...' from origin 'https://xyzlogicflow.tech' 
has been blocked by CORS policy
```

**Solution:**
1. Update `ALLOWED_ORIGINS` in Supabase Edge Functions
2. Include all frontend URLs (production + preview domains):
   ```
   https://xyzlogicflow.tech,https://logic-view-bright.pages.dev,https://*.logic-view-bright.pages.dev
   ```
3. Redeploy affected Edge Functions:
   ```bash
   npm run deploy:functions
   ```

### API Calls Failing

**Check:**
1. Environment variables are set correctly in Cloudflare Pages
2. Supabase project is active
3. Edge Functions are deployed
4. `ALLOWED_ORIGINS` includes your Cloudflare Pages domain
5. No expired API keys

### SSL Certificate Issues

Cloudflare Pages automatically provisions SSL certificates. If you see SSL errors:
1. Wait a few minutes (provisioning can take 1-5 minutes)
2. Check domain configuration in Cloudflare Pages
3. Ensure DNS records are correct

## Preview Deployments

Cloudflare Pages automatically creates preview deployments for:
- Pull requests
- Non-production branches

Preview URLs follow the pattern:
- `https://[branch].[project].pages.dev`
- `https://[commit-hash].[project].pages.dev`

Preview deployments:
- Use the same build configuration
- Can have different environment variables (set in Settings)
- Are automatically cleaned up after branches are deleted

## Rollback

If deployment fails or introduces issues:

1. Go to Cloudflare Pages → Deployments
2. Find the last working deployment
3. Click **...** → **Rollback to this deployment**
4. Confirm rollback

For Supabase Edge Functions:
1. Revert code changes in Git
2. Redeploy functions: `npm run deploy:functions`

## Monitoring and Analytics

### Cloudflare Analytics

View analytics in Cloudflare Dashboard:
- **Analytics & Logs** → Web Analytics
- Metrics: Page views, visitors, requests, bandwidth
- Performance: Response times, cache hit rate

### Supabase Logs

Monitor backend in Supabase Dashboard:
- **Logs** → Edge Functions logs
- **Database** → Query performance
- **Auth** → Authentication events

## Performance Optimization

Cloudflare Pages provides excellent performance out of the box:
- ✅ Global CDN (Cloudflare's network)
- ✅ Automatic HTTPS
- ✅ HTTP/2 and HTTP/3 support
- ✅ Brotli compression
- ✅ Smart routing
- ✅ DDoS protection

## Cost

Cloudflare Pages Free plan includes:
- Unlimited bandwidth
- Unlimited requests
- 500 builds per month
- Custom domains
- Automatic SSL certificates

This is sufficient for most production workloads.

## Support and Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Project GitHub:** https://github.com/logiccamila-wq/logic-view-bright

## Migration from Vercel

If migrating from Vercel:

1. ✅ Vercel config files removed (`vercel.json`, `.vercelignore`)
2. ✅ Build configuration is compatible (same commands)
3. ⚠️ Update `ALLOWED_ORIGINS` in Supabase to include Cloudflare Pages domain
4. ⚠️ Update any hardcoded URLs in the application
5. ✅ DNS: If using Cloudflare DNS, simply point domain to Cloudflare Pages
6. ✅ Environment variables: Copy from Vercel to Cloudflare Pages settings

---

**Last Updated:** 2026-01-19  
**Maintained by:** Logic View Bright Team
