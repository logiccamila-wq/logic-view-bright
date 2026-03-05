-- Alinhamento de schema com funcionalidades atuais da UI
-- Seguro para reexecução: usa IF NOT EXISTS

-- Refuelings: coluna para preço por litro (usada em FuelExpenseDialog)
ALTER TABLE public.refuelings
  ADD COLUMN IF NOT EXISTS price_per_liter numeric;

-- Não Conformidades: coluna resolved_at (usada ao encerrar)
ALTER TABLE public.non_conformities
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- Não Conformidades: status padrão 'open'
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'non_conformities' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.non_conformities ALTER COLUMN status SET DEFAULT 'open';
  END IF;
END $$;

-- Vehicle Documents: garantir colunas usadas em gestão de documentos
ALTER TABLE public.vehicle_documents
  ADD COLUMN IF NOT EXISTS document_type text,
  ADD COLUMN IF NOT EXISTS vehicle_plate text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS paid boolean;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_refuelings_driver_id ON public.refuelings(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_plate ON public.vehicle_documents(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_non_conformities_status ON public.non_conformities(status);

-- Triggers de updated_at (idempotentes)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_non_conformities_updated_at'
  ) THEN
    CREATE TRIGGER update_non_conformities_updated_at
    BEFORE UPDATE ON public.non_conformities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_vehicle_documents_updated_at
    BEFORE UPDATE ON public.vehicle_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

