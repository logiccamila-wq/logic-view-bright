-- Create permissions and client_modules tables compatible with existing schema

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_key TEXT NOT NULL,
  module_key TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_key, module_key)
);

CREATE TABLE IF NOT EXISTS public.client_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key TEXT NOT NULL,
  module_key TEXT NOT NULL,
  status TEXT DEFAULT 'installed',
  installed_at TIMESTAMPTZ DEFAULT now(),
  trial_end TIMESTAMPTZ,
  UNIQUE(client_key, module_key)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'permissions' AND policyname = 'permissions_select_all'
  ) THEN
    CREATE POLICY permissions_select_all ON public.permissions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'client_modules' AND policyname = 'client_modules_select_all'
  ) THEN
    CREATE POLICY client_modules_select_all ON public.client_modules FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

