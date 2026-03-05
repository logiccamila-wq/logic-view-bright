# Post-Deployment Checklist

This checklist should be completed after merging changes to ensure the application is properly deployed and configured.

## Prerequisites

Before starting, ensure you have:
- [ ] Access to Cloudflare Dashboard
- [ ] Access to Supabase Dashboard
- [ ] Supabase project URL and keys
- [ ] GitHub repository access

## 1. Cloudflare Pages Setup

### Create/Configure Pages Project

- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Navigate to **Workers & Pages** → **Pages**
- [ ] If project doesn't exist:
  - [ ] Click **Create a project** → **Connect to Git**
  - [ ] Select repository: `logiccamila-wq/logic-view-bright`
  - [ ] Set **Production branch**: `main`
  - [ ] Set **Build command**: `npm run build`
  - [ ] Set **Build output directory**: `dist`
  - [ ] Set **Framework preset**: Vite
  - [ ] Click **Save and Deploy**

### Configure Environment Variables (Cloudflare Pages)

- [ ] In Pages project, go to **Settings** → **Environment Variables**
- [ ] Add `VITE_SUPABASE_URL`:
  - [ ] Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
  - [ ] Environment: ✅ Production, ✅ Preview
- [ ] Add `VITE_SUPABASE_ANON_KEY`:
  - [ ] Value: Your Supabase anonymous key (public key, safe for frontend)
  - [ ] Environment: ✅ Production, ✅ Preview
- [ ] Add `VITE_APP_URL` (recommended):
  - [ ] Value: `https://xyzlogicflow.tech` (your production domain)
  - [ ] Environment: ✅ Production
- [ ] Click **Save** for each variable

**⚠️ CRITICAL - DO NOT ADD THESE TO CLOUDFLARE PAGES:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (backend only!)
- ❌ `SUPABASE_JWT_SECRET` (not needed)
- ❌ Any AI provider keys (backend only)
- ❌ Any other secrets

### Configure Custom Domain

- [ ] In Pages project, go to **Custom domains**
- [ ] Click **Set up a custom domain**
- [ ] Enter domain: `xyzlogicflow.tech`
- [ ] Cloudflare automatically configures DNS (if domain is in Cloudflare)
- [ ] Wait for SSL certificate provisioning (1-5 minutes)
- [ ] Optional: Add `www.xyzlogicflow.tech` subdomain

## 2. Supabase Edge Functions Configuration

### Configure ALLOWED_ORIGINS

**⚠️ CRITICAL STEP - Required for CORS to work:**

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Select your project
- [ ] Navigate to **Settings** → **Edge Functions**
- [ ] Under **Environment Variables**, find or add `ALLOWED_ORIGINS`
- [ ] Set value to include **ALL** of these domains (comma-separated):
  ```
  https://xyzlogicflow.tech,https://logic-view-bright.pages.dev,https://*.logic-view-bright.pages.dev
  ```
- [ ] Click **Save**

### Verify Other Backend Environment Variables

- [ ] Ensure `SUPABASE_URL` is set (should match frontend)
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (secret, backend only)
- [ ] Optional: Verify AI integration keys if used:
  - [ ] `AI_PROVIDER_KEY`
  - [ ] `AI_PROVIDER_MODEL`
  - [ ] `AI_PROVIDER_ENDPOINT`
  - [ ] `OPENAI_API_KEY`

### Deploy Edge Functions

After updating environment variables:

- [ ] Open terminal
- [ ] Ensure Supabase CLI is installed: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project (first time): `supabase link --project-ref <your-project-ref>`
- [ ] Deploy functions: `npm run deploy:functions`
- [ ] Verify all functions deployed successfully

## 3. Trigger Deployment

### Deploy Frontend

- [ ] Ensure all code changes are committed
- [ ] Push to main branch: `git push origin main`
- [ ] Go to Cloudflare Pages → **Deployments**
- [ ] Verify new deployment started
- [ ] Wait for deployment to complete (usually 1-3 minutes)
- [ ] Check deployment status: Should show "Success"

## 4. Verification

### Basic Checks

- [ ] Visit https://xyzlogicflow.tech
- [ ] Page loads without errors
- [ ] No blank/white screen
- [ ] No "Environment variable" errors in console

### Browser Console Check

- [ ] Open browser console (F12 → Console tab)
- [ ] Refresh the page
- [ ] Verify no errors related to:
  - [ ] Supabase connection
  - [ ] CORS errors
  - [ ] Missing environment variables
  - [ ] 404 or 500 errors

### Authentication Test

- [ ] Navigate to login page: https://xyzlogicflow.tech/login
- [ ] Try logging in with test credentials:
  - Email: `logiccamila@gmail.com`
  - Password: `Multi.13`
- [ ] Login should succeed
- [ ] Verify redirect to dashboard/home page
- [ ] User info should load correctly

### API Functionality Test

- [ ] After logging in, navigate to different modules
- [ ] Check that data loads (drivers, vehicles, trips, etc.)
- [ ] Open Network tab (F12 → Network)
- [ ] Verify API calls to Supabase succeed (Status 200)
- [ ] No CORS errors in responses

### CORS Verification

If you see CORS errors:
```
Access to fetch at 'https://xxxxx.supabase.co/...' has been blocked by CORS policy
```

Fix:
- [ ] Update `ALLOWED_ORIGINS` in Supabase Edge Functions (see step 2)
- [ ] Ensure Cloudflare Pages domain is included
- [ ] Redeploy Edge Functions: `npm run deploy:functions`
- [ ] Clear browser cache and retry

## 5. DNS and Domain Verification

### Verify DNS Configuration

- [ ] Go to Cloudflare Dashboard → DNS
- [ ] Verify CNAME records exist for:
  - [ ] `@` or root domain → Points to Cloudflare Pages
  - [ ] `www` subdomain (optional) → Points to Cloudflare Pages
- [ ] Verify SSL/TLS is enabled (Encryption mode: Full or Full strict)

### Test Domain Access

- [ ] Visit https://xyzlogicflow.tech
- [ ] Verify SSL certificate is valid (padlock icon in browser)
- [ ] No SSL warnings
- [ ] Domain redirects correctly (if www → non-www or vice versa)

## 6. Performance and Security

### Performance Check

- [ ] Test page load speed (should be < 3 seconds)
- [ ] Verify assets are cached (check Network tab → Assets should show from cache on reload)
- [ ] Check Lighthouse score (F12 → Lighthouse):
  - [ ] Performance > 80
  - [ ] Best Practices > 90
  - [ ] SEO > 80

### Security Headers

- [ ] Check response headers include:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Strict-Transport-Security` (HSTS)

## 7. Monitoring Setup

### Enable Cloudflare Analytics

- [ ] Go to Cloudflare Dashboard → Analytics & Logs
- [ ] Enable Web Analytics
- [ ] Note: Analytics may take 24-48 hours to populate

### Enable Supabase Monitoring

- [ ] Go to Supabase Dashboard → Logs
- [ ] Verify Edge Function logs are being captured
- [ ] Set up alerts for errors (optional)

## 8. Documentation Update

### Update Internal Docs

- [ ] Verify deployment guides are current
- [ ] Update team documentation with Cloudflare Pages info
- [ ] Remove any references to Vercel
- [ ] Document new deployment URLs

## Troubleshooting

### Deployment Fails

If Cloudflare Pages deployment fails:
1. Check build logs in Cloudflare Dashboard → Deployments → Failed build
2. Common issues:
   - Missing dependencies in package.json
   - TypeScript errors (run `npm run build` locally)
   - Environment variables not set

### Blank Page After Deployment

If page loads blank:
1. Check browser console for errors
2. Verify environment variables are set in Cloudflare Pages
3. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
4. Trigger a new deployment (Retry deployment button)

### CORS Errors Persist

If CORS errors continue:
1. Double-check `ALLOWED_ORIGINS` includes exact Cloudflare Pages URL
2. No trailing slashes in origins
3. Use `https://` (not `http://`)
4. Redeploy Edge Functions after changing env vars
5. Clear browser cache completely

### API Calls Fail (401/403)

If API returns authentication errors:
1. Verify Supabase keys are correct
2. Check if anonymous key is valid (not expired)
3. Verify Row Level Security (RLS) policies in Supabase
4. Check user roles are properly configured

## Sign-off

After completing all steps above:

- [ ] All checks passed
- [ ] Application is fully functional
- [ ] No errors in browser console
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Performance is acceptable
- [ ] Documentation updated

**Deployment completed by:** ___________________  
**Date:** ___________________  
**Notes:** ___________________

---

**For detailed deployment instructions, see:**
- [CLOUDFLARE_PAGES_DEPLOYMENT.md](./CLOUDFLARE_PAGES_DEPLOYMENT.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
