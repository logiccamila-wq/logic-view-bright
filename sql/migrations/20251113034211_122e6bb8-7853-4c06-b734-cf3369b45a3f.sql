-- Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate text NOT NULL,
  vehicle_model text NOT NULL,
  odometer integer NOT NULL,
  issue_description text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada')),
  mechanic_id uuid REFERENCES auth.users(id),
  mechanic_notes text,
  parts_used jsonb DEFAULT '[]'::jsonb,
  labor_hours decimal(5,2) DEFAULT 0,
  estimated_completion timestamp with time zone,
  completed_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de TPMS (Tire Pressure Monitoring System)
CREATE TABLE IF NOT EXISTS public.tpms_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate text NOT NULL,
  tire_position text NOT NULL,
  pressure_psi decimal(5,2) NOT NULL,
  temperature_celsius decimal(5,2),
  tire_brand text,
  tire_model text,
  tread_depth_mm decimal(4,2),
  alert_level text NOT NULL DEFAULT 'verde' CHECK (alert_level IN ('verde', 'amarelo', 'vermelho')),
  last_calibration timestamp with time zone,
  notes text,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de Checklist de Manutenção
CREATE TABLE IF NOT EXISTS public.maintenance_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE,
  vehicle_plate text NOT NULL,
  checklist_type text NOT NULL CHECK (checklist_type IN ('preventiva', 'corretiva', 'inspecao')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  mechanic_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida')),
  photos jsonb DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de Inventário de Peças da Oficina
CREATE TABLE IF NOT EXISTS public.workshop_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_code text NOT NULL UNIQUE,
  part_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  minimum_stock integer NOT NULL DEFAULT 5,
  unit_price decimal(10,2),
  supplier text,
  location text,
  last_restocked timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tpms_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies para service_orders
CREATE POLICY "Mecânicos podem ver todas ordens de serviço"
  ON public.service_orders FOR SELECT
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem criar ordens de serviço"
  ON public.service_orders FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem atualizar ordens de serviço"
  ON public.service_orders FOR UPDATE
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para tpms_readings
CREATE POLICY "Mecânicos podem ver leituras TPMS"
  ON public.tpms_readings FOR SELECT
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem criar leituras TPMS"
  ON public.tpms_readings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem atualizar leituras TPMS"
  ON public.tpms_readings FOR UPDATE
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para maintenance_checklists
CREATE POLICY "Mecânicos podem ver checklists"
  ON public.maintenance_checklists FOR SELECT
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem criar checklists"
  ON public.maintenance_checklists FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Mecânicos podem atualizar checklists"
  ON public.maintenance_checklists FOR UPDATE
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para workshop_inventory
CREATE POLICY "Mecânicos podem ver inventário"
  ON public.workshop_inventory FOR SELECT
  USING (has_role(auth.uid(), 'mecanico'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Apenas admins podem atualizar inventário"
  ON public.workshop_inventory FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers para updated_at
CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_checklists_updated_at
  BEFORE UPDATE ON public.maintenance_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workshop_inventory_updated_at
  BEFORE UPDATE ON public.workshop_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();