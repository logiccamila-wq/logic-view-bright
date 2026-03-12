DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='gate_events' AND column_name='is_visitor'
  ) THEN
    ALTER TABLE public.gate_events ADD COLUMN is_visitor BOOLEAN DEFAULT false;
  END IF;
END $$;

