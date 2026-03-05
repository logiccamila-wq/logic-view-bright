-- Tabela de Planos de Manutenção Preventiva por tipo de veículo
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('cavalo', 'carreta', 'truck')),
  plan_item TEXT NOT NULL,
  interval_km INTEGER NOT NULL,
  tolerance_km INTEGER NOT NULL DEFAULT 500,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;

-- Permissões de leitura para times de manutenção/frota e admins
CREATE POLICY "Staff de manutenção e admins podem ver planos"
  ON public.maintenance_plans FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR
    has_role(auth.uid(), 'maintenance_manager'::app_role)
  );

-- Permissões de escrita para gestores de manutenção e admins
CREATE POLICY "Gestores de manutenção e admins podem gerenciar planos"
  ON public.maintenance_plans FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'maintenance_manager'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_maintenance_plans_updated_at
  BEFORE UPDATE ON public.maintenance_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seeds de planos padrão (ajustáveis conforme documento)
INSERT INTO public.maintenance_plans (vehicle_type, plan_item, interval_km, tolerance_km, notes)
VALUES
  -- Cavalo mecânico
  ('cavalo', 'Troca de óleo do motor', 15000, 1000, 'Óleo e filtro conforme fabricante'),
  ('cavalo', 'Filtro de óleo', 15000, 1000, 'Substituir junto ao óleo'),
  ('cavalo', 'Filtro de ar', 20000, 1000, 'Inspecionar a cada 10.000km'),
  ('cavalo', 'Filtro de combustível', 30000, 1000, 'Troca preventiva'),
  ('cavalo', 'Revisão de freios', 20000, 1000, 'Pastilhas, lonas e discos'),
  ('cavalo', 'Suspensão e buchas', 30000, 1500, 'Inspeção geral e torque'),
  ('cavalo', 'Alinhamento e balanceamento', 20000, 1000, 'Rotação de pneus conforme desgaste'),
  ('cavalo', 'Lubrificação do chassi', 10000, 500, 'Pontos de graxa conforme manual'),

  -- Carreta / semi-reboque
  ('carreta', 'Revisão de freios (carreta)', 20000, 1000, 'Sistema pneumático e lonas'),
  ('carreta', 'Suspensão e eixos', 30000, 1500, 'Inspeção e torque de fixadores'),
  ('carreta', 'Pinos e engates (quinto roda)', 15000, 1000, 'Lubrificação e inspeção'),
  ('carreta', 'Iluminação e elétrica', 15000, 1000, 'Chicotes e conectores'),
  ('carreta', 'Rodízio e balanceamento de pneus', 20000, 1000, 'Conforme desgaste'),

  -- Truck
  ('truck', 'Troca de óleo do motor', 10000, 800, 'Óleo e filtro conforme manual'),
  ('truck', 'Filtros (óleo/ar/combustível)', 15000, 1000, 'Substituição programada'),
  ('truck', 'Revisão de freios', 15000, 1000, 'Pastilhas/lonas e fluido'),
  ('truck', 'Suspensão', 25000, 1500, 'Inspeção e ajustes'),
  ('truck', 'Alinhamento e balanceamento', 15000, 1000, 'Rotação de pneus');