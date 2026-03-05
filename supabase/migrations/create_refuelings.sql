-- Criação segura da tabela de abastecimentos, compatível com a UI atual
-- Evita falhas em ambientes onde a tabela ainda não existe

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.refuelings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  vehicle_plate text,
  km integer,
  liters numeric,
  total_value numeric,
  cost_per_km numeric,
  price_per_liter numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.refuelings ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (seleção pelo próprio motorista e admins/gestores)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refuelings' AND policyname = 'Motoristas podem ver seus abastecimentos'
  ) THEN
    CREATE POLICY "Motoristas podem ver seus abastecimentos"
      ON public.refuelings FOR SELECT
      USING (
        auth.uid() = driver_id
        OR public.has_role(auth.uid(), 'admin'::app_role)
        OR public.has_role(auth.uid(), 'logistics_manager'::app_role)
        OR public.has_role(auth.uid(), 'fleet_maintenance'::app_role)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'refuelings' AND policyname = 'Motoristas podem criar abastecimentos'
  ) THEN
    CREATE POLICY "Motoristas podem criar abastecimentos"
      ON public.refuelings FOR INSERT
      WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_refuelings_driver_id ON public.refuelings(driver_id);
CREATE INDEX IF NOT EXISTS idx_refuelings_created_at ON public.refuelings(created_at);

