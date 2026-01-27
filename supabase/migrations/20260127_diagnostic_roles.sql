-- Migration 20260127_diagnostic_roles
-- 
-- This migration provides diagnostic utilities for troubleshooting user roles
-- without automatically granting privileges. It is a NO-OP migration that keeps
-- the migration history intact.
--
-- IMPORTANT: This migration does NOT automatically assign roles to any users.
-- Admin role assignment should be managed through standard provisioning flows,
-- not hardcoded in migrations.
--
-- For diagnostic purposes, use the script under scripts/diagnose-user-roles.sql
-- which can be run manually in specific environments with appropriate parameters.

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260127_diagnostic_roles completed successfully.';
  RAISE NOTICE 'This migration does not modify any data.';
  RAISE NOTICE 'For admin role diagnostics, use scripts/diagnose-user-roles.sql manually.';
END $$;
