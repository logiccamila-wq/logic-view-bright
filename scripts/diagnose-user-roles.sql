-- Diagnostic Script: Verify and display user roles
-- 
-- This script checks if a user exists and displays their current roles.
-- It does NOT automatically grant any privileges.
--
-- Usage:
--   1. Replace 'user@example.com' with the target user email
--   2. Run this script manually in the Supabase SQL Editor
--   3. Review the output to diagnose role issues
--
-- IMPORTANT: This is a diagnostic tool only. Admin role assignment should be
-- done through proper provisioning flows, not via automatic scripts.

DO $$
DECLARE
  user_record RECORD;
  role_record RECORD;
  role_count INT;
  target_email TEXT := 'user@example.com'; -- CHANGE THIS TO TARGET USER EMAIL
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'User Roles Diagnostic Script';
  RAISE NOTICE 'Target email: %', target_email;
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  -- Buscar usuário
  SELECT id, email, email_confirmed_at, created_at
  INTO user_record
  FROM auth.users
  WHERE email = target_email;

  IF user_record.id IS NULL THEN
    RAISE NOTICE '❌ ERROR: User with email % not found', target_email;
    RAISE NOTICE 'Verify the email address is correct and the user exists in auth.users';
    RETURN;
  END IF;

  RAISE NOTICE '✅ User found:';
  RAISE NOTICE '   ID: %', user_record.id;
  RAISE NOTICE '   Email: %', user_record.email;
  RAISE NOTICE '   Email confirmed: %', user_record.email_confirmed_at IS NOT NULL;
  RAISE NOTICE '   Created at: %', user_record.created_at;
  RAISE NOTICE '───────────────────────────────────────────────────────────';

  -- Verificar roles
  SELECT COUNT(*) INTO role_count
  FROM user_roles
  WHERE user_id = user_record.id;

  RAISE NOTICE 'Total roles assigned: %', role_count;
  RAISE NOTICE '';

  IF role_count = 0 THEN
    RAISE NOTICE '⚠️  WARNING: User has no roles assigned';
    RAISE NOTICE 'This may explain why modules are not visible in the sidebar.';
  ELSE
    RAISE NOTICE 'Assigned roles:';
    -- Mostrar roles existentes
    FOR role_record IN 
      SELECT role, created_at FROM user_roles WHERE user_id = user_record.id ORDER BY created_at
    LOOP
      RAISE NOTICE '   • % (assigned: %)', role_record.role, role_record.created_at;
    END LOOP;
  END IF;

  RAISE NOTICE '───────────────────────────────────────────────────────────';
  
  -- Check for admin role specifically
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_record.id AND role = 'admin') THEN
    RAISE NOTICE '✅ User HAS admin role';
  ELSE
    RAISE NOTICE '⚠️  User does NOT have admin role';
    RAISE NOTICE '';
    RAISE NOTICE 'To assign admin role, use proper provisioning flow:';
    RAISE NOTICE '   INSERT INTO user_roles (user_id, role)';
    RAISE NOTICE '   VALUES (''%'', ''admin'');', user_record.id;
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Diagnostic completed';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
