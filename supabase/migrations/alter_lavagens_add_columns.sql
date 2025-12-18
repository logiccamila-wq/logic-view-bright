DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='lavagens' AND column_name='km'
  ) THEN
    ALTER TABLE public.lavagens ADD COLUMN km INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='lavagens' AND column_name='responsavel_id'
  ) THEN
    ALTER TABLE public.lavagens ADD COLUMN responsavel_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

