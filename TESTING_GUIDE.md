# Testing Guide - Sidebar Modules Fix

## 🎯 Testing Objectives

Verify that all 6 fixes are working correctly and that modules appear in the sidebar for admin users.

## 📋 Pre-requisites

- Access to the application (local or deployed)
- Admin user credentials (`logiccamila@gmail.com`)
- Browser DevTools (F12)
- Supabase console access (for SQL migration if needed)

## 🧪 Test Cases

### Test Case 1: Debug Logging in Console

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console (Ctrl+L or Cmd+K)
4. Navigate to application login page
5. Login with admin credentials

**Expected Results:**
```
✅ 🔐 [AuthContext] Buscando roles para user: [user-id]
✅ 🔐 [AuthContext] Resultado da query: { data: [...], error: null, userId: '...' }
✅ 🔐 [AuthContext] Roles processadas: { raw: [...], normalized: [...], userId: '...' }
✅ 🎨 [AppSidebar] Renderizando com: { user: '...', loading: false, ... }
```

**Pass Criteria:**
- All logs appear with emoji indicators
- User ID is visible
- Query results are logged
- Roles are shown (raw and normalized)
- Sidebar render log shows correct counts

**Failure Handling:**
- If logs don't appear, check browser console settings (ensure all levels enabled)
- If errors appear, check network tab for API failures

---

### Test Case 2: Admin Fallback Override

**Steps:**
1. Login with `logiccamila@gmail.com`
2. Open DevTools Console
3. Look for admin override log

**Expected Results:**
```
✅ 🔓 [AuthContext] Admin override ativo para: logiccamila@gmail.com
```

**Pass Criteria:**
- Override log appears for each module check
- Modules are visible in sidebar
- User has access to all features

**Failure Handling:**
- If override doesn't trigger, check email is exactly `logiccamila@gmail.com`
- Verify code in `AuthContext.tsx` line 329-332

---

### Test Case 3: Loading State

**Steps:**
1. Logout from application
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Watch sidebar during page load

**Expected Results:**
```
✅ Sidebar shows logo "XYZLogicFlow"
✅ Loading spinner appears below logo
✅ Spinner is visible for 1-3 seconds
✅ Sidebar content loads after spinner
✅ No "flash" of empty content
```

**Pass Criteria:**
- Spinner visible during auth
- Smooth transition to content
- No empty sidebar flash

**Failure Handling:**
- If spinner doesn't show, check network speed (may load too fast)
- Try throttling network in DevTools (Slow 3G)

---

### Test Case 4: Modules Visible in Sidebar

**Steps:**
1. Login with admin user
2. Wait for page to load completely
3. Scroll sidebar to "Módulos" section

**Expected Results:**
```
✅ Section header "Módulos" is visible
✅ 9 module items appear:
   - WMS
   - TMS
   - OMS
   - SCM
   - CRM
   - ERP
   - EIP
   - Innovation Lab
   - Developer
```

**Pass Criteria:**
- All 9 modules visible
- Each module is clickable
- Icons appear correctly
- No empty "Módulos" section

**Failure Handling:**
- If modules missing, check console for permission logs
- Use "Recarregar Permissões" button
- Check if roles exist in database

---

### Test Case 5: Reload Permissions Button

**Steps:**
1. Login as admin
2. Scroll to bottom of sidebar
3. Look for "🔄 Recarregar Permissões" button
4. Click the button

**Expected Results:**
```
✅ Button visible above "Sair" button
✅ Toast notification: "Recarregando permissões..."
✅ Console log: 🔄 Permissões recarregadas: [data]
✅ Toast notification: "Permissões atualizadas!"
✅ Page reloads automatically
```

**Pass Criteria:**
- Button is visible and styled correctly
- Toast notifications appear
- Console shows reload log
- Page reloads after success

**Failure Handling:**
- If button not visible, check if sidebar is collapsed
- If reload fails, check Supabase connection
- If no data returned, check user_roles table

---

### Test Case 6: Debug Message When No Modules

**Setup:**
1. Temporarily modify code to simulate empty modules:
```typescript
const filteredModulesItems = []; // Force empty
```

**Steps:**
1. Save changes and reload page
2. Login as admin
3. Scroll to where "Módulos" section should be

**Expected Results:**
```
✅ Warning message appears:
   "⚠️ Nenhum módulo disponível."
✅ User email shown below:
   "Email: logiccamila@gmail.com"
```

**Pass Criteria:**
- Warning message visible
- Email displayed correctly
- Message only shows when not loading

**Cleanup:**
- Revert code changes
- Reload to verify modules appear again

**Failure Handling:**
- If message doesn't appear, check collapsed state
- Verify loading state is false

---

### Test Case 7: SQL Diagnostic Migration

**Prerequisites:**
- Access to Supabase SQL Editor
- Admin permissions in Supabase

**Steps:**
1. Open Supabase SQL Editor
2. Open file `supabase/migrations/20260127_diagnostic_roles.sql`
3. Run the entire migration
4. Check output in "Results" tab

**Expected Results:**
```sql
✅ NOTICE: Usuário encontrado: ID=..., Email=logiccamila@gmail.com
✅ NOTICE: Total de roles: 1 (or more)
✅ NOTICE: Role existente: admin
✅ NOTICE: Role ADMIN já existe (or "adicionada!")

✅ Query results show:
   | email                  | role  | created_at          |
   |------------------------|-------|---------------------|
   | logiccamila@gmail.com  | admin | 2024-XX-XX XX:XX:XX |
```

**Pass Criteria:**
- Migration runs without errors
- User is found
- Admin role exists or is added
- Final SELECT returns correct data

**Failure Handling:**
- If user not found, check auth.users table
- If role not added, check user_roles table permissions
- If errors occur, check PostgreSQL logs

---

## 🔄 Integration Test: Complete Flow

**Steps:**
1. **Logout** from application
2. **Clear** browser cache and console
3. **Navigate** to login page
4. **Open** DevTools Console
5. **Login** with `logiccamila@gmail.com`
6. **Watch** for loading spinner
7. **Check** console logs appear
8. **Verify** modules section is visible
9. **Click** on a module (e.g., "WMS")
10. **Return** to dashboard
11. **Click** "🔄 Recarregar Permissões"
12. **Verify** page reloads successfully

**Expected Complete Flow:**
```
1. Login form submitted
2. 🔐 [AuthContext] Buscando roles para user: ...
3. Loading spinner appears in sidebar
4. 🔐 [AuthContext] Resultado da query: ...
5. 🔐 [AuthContext] Roles processadas: ...
6. 🔓 [AuthContext] Admin override ativo: ...
7. 🎨 [AppSidebar] Renderizando com: ...
8. Sidebar shows all sections including Módulos
9. Module navigation works
10. Reload button triggers refresh
11. Page reloads with all logs repeated
```

---

## 📊 Test Results Template

Use this template to record test results:

```markdown
# Test Results - Sidebar Modules Fix
Date: ____________
Tester: __________
Environment: _____ (Local / Staging / Production)

## Test Case Results

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | Debug Logging | ☐ Pass ☐ Fail | |
| 2 | Admin Fallback | ☐ Pass ☐ Fail | |
| 3 | Loading State | ☐ Pass ☐ Fail | |
| 4 | Modules Visible | ☐ Pass ☐ Fail | |
| 5 | Reload Button | ☐ Pass ☐ Fail | |
| 6 | Debug Message | ☐ Pass ☐ Fail | |
| 7 | SQL Migration | ☐ Pass ☐ Fail | |
| 8 | Integration Test | ☐ Pass ☐ Fail | |

## Issues Found
(List any issues discovered during testing)

## Screenshots
(Attach screenshots of key states)

## Conclusion
☐ All tests passed - Ready for production
☐ Some tests failed - Needs fixes
☐ Blocked - Cannot proceed

## Approvals
- Developer: ____________
- QA: ____________
- Product Owner: ____________
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Modules Still Not Showing

**Symptoms:**
- Sidebar loads but Módulos section is empty
- Console shows empty roles array

**Diagnosis:**
```
Check console for:
🔐 [AuthContext] Roles processadas: { raw: [], normalized: [], ... }
```

**Solutions:**
1. Run SQL migration to add admin role
2. Use "Recarregar Permissões" button
3. Check Supabase user_roles table manually
4. Verify admin override is active for correct email

---

### Issue 2: Logs Not Appearing

**Symptoms:**
- Console is empty or shows minimal output
- Can't debug permission issues

**Diagnosis:**
- Check browser console filter settings
- Verify code was deployed correctly

**Solutions:**
1. Ensure Console shows "All levels" (not just Errors)
2. Check "Preserve log" is enabled
3. Verify latest code is deployed (check git commit hash)
4. Hard reload page (Ctrl+Shift+R)

---

### Issue 3: Loading Spinner Never Stops

**Symptoms:**
- Sidebar stuck on loading spinner
- Page doesn't progress

**Diagnosis:**
```
Check console for errors:
❌ [AuthContext] Erro ao buscar roles: ...
```

**Solutions:**
1. Check Supabase connection (network tab)
2. Verify user_roles table exists
3. Check browser console for JS errors
4. Restart application

---

### Issue 4: Reload Button Not Working

**Symptoms:**
- Button click does nothing
- No toast notifications appear

**Diagnosis:**
- Check browser console for errors
- Verify toast library (sonner) is loaded

**Solutions:**
1. Check if user object exists
2. Verify Supabase client is initialized
3. Check toast notifications are not blocked
4. Try hard reload (Ctrl+Shift+R)

---

## 📝 Post-Testing Checklist

After completing all tests:

- [ ] All test cases passed
- [ ] Console logs are working
- [ ] Admin fallback is active
- [ ] Loading state is smooth
- [ ] Modules are visible
- [ ] Reload button works
- [ ] Debug messages appear correctly
- [ ] SQL migration tested
- [ ] Screenshots captured
- [ ] Test results documented
- [ ] Issues reported (if any)
- [ ] Product Owner notified
- [ ] Ready for deployment

---

## 🚀 Deployment Verification

After deploying to production:

1. **Immediately after deploy:**
   - [ ] Login with admin user
   - [ ] Verify modules appear
   - [ ] Check console for errors
   
2. **Within 24 hours:**
   - [ ] Monitor error logs
   - [ ] Check user feedback
   - [ ] Verify no regressions
   
3. **Within 1 week:**
   - [ ] Collect metrics (load times, errors)
   - [ ] User satisfaction survey
   - [ ] Consider removing debug logs

---

## 📞 Support Contacts

If issues persist:

- **Developer:** @logiccamila-wq
- **Supabase Support:** support@supabase.com
- **Emergency Rollback:** Contact DevOps team

## 📚 Related Documentation

- `SIDEBAR_MODULES_FIX.md` - Complete fix documentation
- `VISUAL_COMPARISON.md` - Before/After comparison
- `README_FINAL.md` - General project documentation
