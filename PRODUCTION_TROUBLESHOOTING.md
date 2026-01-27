# Production Deployment - Troubleshooting Guide

## Issue: Modules Not Appearing in Production (Vercel/Cloudflare)

### Root Cause

The admin override feature **only works in development mode** for security reasons:

```typescript
// This code only runs when import.meta.env.DEV === true
if (isDev && user?.email === adminOverrideEmail) {
  console.log('🔓 [AuthContext] Admin override ativo para:', user.email);
  return true;
}
```

In production builds (Vercel, Cloudflare, etc.):
- `import.meta.env.DEV` is `false`
- Admin override is **disabled**
- Users need actual roles in the database

### Solution: Add Admin Role to Database

#### Step 1: Diagnose Current Roles

1. Open Supabase SQL Editor
2. Run the diagnostic script from `scripts/diagnose-user-roles.sql`
3. Change the target email:
   ```sql
   target_email TEXT := 'logiccamila@gmail.com'; -- Change this line
   ```

#### Step 2: Add Admin Role (If Missing)

If the diagnostic shows no admin role, run this SQL:

```sql
-- Add admin role to user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'logiccamila@gmail.com'
ON CONFLICT DO NOTHING;
```

Verify it was added:

```sql
-- Verify admin role
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'logiccamila@gmail.com';
```

#### Step 3: Refresh the Application

1. **Logout** from the application
2. **Login** again
3. Modules should now appear in the sidebar

Alternatively, use the **"🔄 Recarregar Permissões"** button in the sidebar (if visible).

---

## Environment Differences

### Development Mode (`npm run dev`)
- ✅ Admin override active for configured email
- ✅ Detailed console logs visible
- ✅ No database role required for override email

### Production Mode (Vercel/Cloudflare)
- 🔒 Admin override **disabled** (security)
- 🔒 Console logs **disabled** (performance)
- ✅ Requires actual database roles

---

## Why This Design?

### Security Considerations

**Development Override:**
- ✅ Speeds up local development
- ✅ No need to configure database for every developer
- ⚠️ Only active when `NODE_ENV !== 'production'`

**Production Enforcement:**
- 🔒 Prevents hardcoded backdoor accounts
- 🔒 Forces proper role management
- 🔒 Audit trail in database
- 🔒 Easy to revoke access

### Performance Considerations

**Production Optimizations:**
- Zero console logging (no overhead)
- No development checks
- Faster permission verification
- Smaller bundle size (dead code elimination)

---

## Common Issues & Solutions

### Issue 1: "Modules still not appearing after adding role"

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout and login again
3. Check browser console for errors (F12)
4. Verify role was actually inserted:
   ```sql
   SELECT * FROM user_roles WHERE user_id IN (
     SELECT id FROM auth.users WHERE email = 'logiccamila@gmail.com'
   );
   ```

### Issue 2: "Can't see reload permissions button"

The button only appears when:
- User is logged in (`user` is not null)
- Sidebar is not collapsed (`!collapsed`)

**Solution:**
- Expand the sidebar if collapsed
- Ensure you're logged in
- Check if user object is loaded

### Issue 3: "Different behavior between Vercel and Cloudflare"

Both platforms run production builds where:
- `import.meta.env.DEV` is `false`
- Admin override is disabled
- Database roles are required

**Solution:**
- Ensure roles are added to the database
- Both platforms will behave identically

### Issue 4: "Error: Table 'user_roles' does not exist"

**Solution:**
1. Run all pending migrations:
   ```bash
   npm run db:push
   ```
2. Or manually create the table:
   ```sql
   CREATE TABLE IF NOT EXISTS user_roles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     role TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, role)
   );
   ```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run all database migrations
- [ ] Verify `user_roles` table exists
- [ ] Add admin role for production users
- [ ] Test login/logout flow
- [ ] Verify modules appear for admin users
- [ ] Check browser console for errors
- [ ] Test on both Vercel and Cloudflare (if using both)

---

## Testing Production Locally

To test production build behavior locally:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

This will run with `import.meta.env.DEV === false`, simulating production environment.

---

## Environment Variables

### Development (.env.local)
```env
VITE_ADMIN_OVERRIDE_EMAIL=logiccamila@gmail.com
```

### Production (Vercel/Cloudflare Dashboard)
```env
# Not needed - admin override disabled in production
# Roles must be managed in database
```

---

## Need Help?

If you're still experiencing issues:

1. **Check Supabase Logs** - Look for role query errors
2. **Check Browser Console** - Look for JavaScript errors (even in prod)
3. **Verify Environment** - Ensure you're testing the right deployment
4. **Run Diagnostic Script** - Use `scripts/diagnose-user-roles.sql`

For additional support, see:
- `SIDEBAR_MODULES_FIX.md` - Complete implementation details
- `TESTING_GUIDE.md` - Comprehensive testing procedures
- `IMPLEMENTATION_SUMMARY.md` - Project summary

---

**Last Updated:** 2026-01-27
**Version:** 1.0.0
