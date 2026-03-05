-- Criar tabela de viagens para aprovação
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid REFERENCES auth.users(id) NOT NULL,
  driver_name text NOT NULL,
  vehicle_plate text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  estimated_departure timestamp with time zone,
  estimated_arrival timestamp with time zone,
  notes text
);

-- Criar tabela de macros de viagem
CREATE TABLE IF NOT EXISTS public.trip_macros (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES auth.users(id) NOT NULL,
  macro_type text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  location_lat numeric,
  location_lng numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de abastecimentos
CREATE TABLE IF NOT EXISTS public.refuelings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid REFERENCES public.trips(id),
  driver_id uuid REFERENCES auth.users(id) NOT NULL,
  vehicle_plate text NOT NULL,
  km numeric NOT NULL,
  liters numeric NOT NULL,
  total_value numeric NOT NULL,
  cost_per_km numeric GENERATED ALWAYS AS (total_value / NULLIF(km, 0)) STORED,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refuelings ENABLE ROW LEVEL SECURITY;

-- RLS Policies para trips
CREATE POLICY "Motoristas podem ver suas próprias viagens"
  ON public.trips FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager') OR has_role(auth.uid(), 'maintenance_manager'));

CREATE POLICY "Motoristas podem criar viagens"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Gerentes podem aprovar viagens"
  ON public.trips FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager') OR has_role(auth.uid(), 'maintenance_manager'));

-- RLS Policies para trip_macros
CREATE POLICY "Motoristas podem ver suas macros"
  ON public.trip_macros FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Motoristas podem criar macros"
  ON public.trip_macros FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- RLS Policies para refuelings
CREATE POLICY "Motoristas podem ver seus abastecimentos"
  ON public.refuelings FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager') OR has_role(auth.uid(), 'fleet_maintenance'));

CREATE POLICY "Motoristas podem criar abastecimentos"
  ON public.refuelings FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();