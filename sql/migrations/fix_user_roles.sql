-- Ensure enum type app_role exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'app_role'
  ) THEN
    CREATE TYPE app_role AS ENUM (
      'admin',
      'driver',
      'fleet_maintenance',
      'maintenance_assistant',
      'finance',
      'operations',
      'commercial',
      'logistics_manager',
      'maintenance_manager',
      'super_consultant'
    );
  END IF;
END
$$;

-- Ensure table public.user_roles exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- Add column role if missing (for older schemas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN role app_role;
    -- Backfill if needed (choose a safe default)
    UPDATE public.user_roles SET role = 'operations' WHERE role IS NULL;
    ALTER TABLE public.user_roles ALTER COLUMN role SET NOT NULL;
  END IF;
END
$$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);

-- PostgREST hints (optional): make sure RLS doesn't block service role (it doesn't)
-- RLS is not required for service role operations; keep table accessible via PostgREST
