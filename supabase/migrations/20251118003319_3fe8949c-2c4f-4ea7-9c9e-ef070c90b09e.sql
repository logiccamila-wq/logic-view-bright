-- Vehicles master table for tractors (cavalos mecânicos)
CREATE TABLE IF NOT EXISTS public.vehicles (
  placa TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  modelo TEXT,
  ano INTEGER,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_tipo ON public.vehicles(tipo);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- View policy (vehicles are not sensitive)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Everyone can view vehicles'
  ) THEN
    CREATE POLICY "Everyone can view vehicles"
    ON public.vehicles
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Insert policy for managers/maintenance
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Managers can insert vehicles'
  ) THEN
    CREATE POLICY "Managers can insert vehicles"
    ON public.vehicles
    FOR INSERT
    WITH CHECK (
      has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'logistics_manager')
      OR has_role(auth.uid(), 'fleet_maintenance')
      OR has_role(auth.uid(), 'maintenance_manager')
    );
  END IF;
END $$;

-- Update policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Managers can update vehicles'
  ) THEN
    CREATE POLICY "Managers can update vehicles"
    ON public.vehicles
    FOR UPDATE
    USING (
      has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'logistics_manager')
      OR has_role(auth.uid(), 'fleet_maintenance')
      OR has_role(auth.uid(), 'maintenance_manager')
    );
  END IF;
END $$;

-- Delete policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Managers can delete vehicles'
  ) THEN
    CREATE POLICY "Managers can delete vehicles"
    ON public.vehicles
    FOR DELETE
    USING (
      has_role(auth.uid(), 'admin')
      OR has_role(auth.uid(), 'logistics_manager')
      OR has_role(auth.uid(), 'fleet_maintenance')
      OR has_role(auth.uid(), 'maintenance_manager')
    );
  END IF;
END $$;

-- Updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicles_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;