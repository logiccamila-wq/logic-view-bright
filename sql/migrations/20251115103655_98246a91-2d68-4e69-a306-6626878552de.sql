-- Criar tabela de pedidos de peças
CREATE TABLE IF NOT EXISTS public.parts_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL,
  mechanic_name TEXT NOT NULL,
  vehicle_plate TEXT,
  service_order_id UUID,
  parts_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  urgency TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;

-- Mecânicos podem criar e ver seus pedidos
CREATE POLICY "Mecânicos podem criar pedidos de peças"
ON public.parts_requests
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'fleet_maintenance') OR 
  has_role(auth.uid(), 'maintenance_assistant') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Mecânicos podem ver seus pedidos"
ON public.parts_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = mechanic_id OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR
  has_role(auth.uid(), 'maintenance_manager')
);

-- Gestores podem atualizar pedidos
CREATE POLICY "Gestores podem atualizar pedidos"
ON public.parts_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR
  has_role(auth.uid(), 'maintenance_manager')
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_parts_requests_updated_at
BEFORE UPDATE ON public.parts_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de área da oficina (coordenadas do pátio)
CREATE TABLE IF NOT EXISTS public.workshop_area (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  center_lat NUMERIC NOT NULL,
  center_lon NUMERIC NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 120,
  boundary_coords JSONB,
  area_m2 NUMERIC,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workshop_area ENABLE ROW LEVEL SECURITY;

-- Todos os autenticados podem ver as áreas
CREATE POLICY "Usuários podem ver áreas da oficina"
ON public.workshop_area
FOR SELECT
TO authenticated
USING (true);

-- Apenas admins podem gerenciar áreas
CREATE POLICY "Admins podem gerenciar áreas"
ON public.workshop_area
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Inserir coordenadas da Calango Molas
INSERT INTO public.workshop_area (
  name, 
  center_lat, 
  center_lon, 
  radius_meters,
  area_m2,
  address,
  notes
) VALUES (
  'Calango Molas - Oficina Principal',
  -8.272213,
  -35.028048,
  120,
  14400,
  'Distrito Industrial Diper – Cabo de Santo Agostinho – PE',
  'Área aproximada: 120m x 120m = 14.400 m²'
);