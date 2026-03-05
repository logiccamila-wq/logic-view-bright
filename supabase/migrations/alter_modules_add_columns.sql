DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='modules' AND column_name='category') THEN
    ALTER TABLE public.modules ADD COLUMN category TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='modules' AND column_name='description') THEN
    ALTER TABLE public.modules ADD COLUMN description TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='modules' AND column_name='enabled') THEN
    ALTER TABLE public.modules ADD COLUMN enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='modules' AND column_name='created_at') THEN
    ALTER TABLE public.modules ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='modules' AND column_name='updated_at') THEN
    ALTER TABLE public.modules ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

