-- Create modules table with a stable 'key' identifier used by UI and APIs
CREATE TABLE IF NOT EXISTS public.modules (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'modules' AND policyname = 'modules_select_all'
  ) THEN
    CREATE POLICY modules_select_all ON public.modules FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

