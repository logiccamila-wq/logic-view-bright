-- Tabela para rastreamento ao vivo de veículos
CREATE TABLE IF NOT EXISTS public.vehicle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate TEXT NOT NULL,
  driver_id UUID,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading INTEGER,
  status TEXT DEFAULT 'em_transito',
  trip_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL
);

-- Index para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_plate ON public.vehicle_tracking(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_timestamp ON public.vehicle_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_tracking_trip ON public.vehicle_tracking(trip_id);

-- Habilitar RLS
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem ver rastreamento"
  ON public.vehicle_tracking FOR SELECT
  USING (true);

CREATE POLICY "Motoristas podem inserir seu rastreamento"
  ON public.vehicle_tracking FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Habilitar realtime
ALTER TABLE public.vehicle_tracking REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_tracking;