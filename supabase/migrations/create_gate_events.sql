CREATE TABLE IF NOT EXISTS public.gate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate TEXT REFERENCES public.vehicles(plate) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('Entrada','Saida')),
  odometer_km INTEGER,
  driver_name TEXT,
  authorized_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gate_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gate_events' AND policyname = 'gate_events_select_all'
  ) THEN
    CREATE POLICY gate_events_select_all ON public.gate_events FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gate_events' AND policyname = 'gate_events_insert_all'
  ) THEN
    CREATE POLICY gate_events_insert_all ON public.gate_events FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

