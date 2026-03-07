CREATE TABLE IF NOT EXISTS public.gate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate TEXT NOT NULL,
  driver_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('entry', 'exit')),
  odometer INTEGER,
  reason TEXT,
  authorized_by TEXT,
  is_visitor BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.gate_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver eventos de portaria"
  ON public.gate_events FOR SELECT
  USING (true);

CREATE POLICY "Portaria pode inserir eventos"
  ON public.gate_events FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gate_events_plate ON public.gate_events(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_gate_events_timestamp ON public.gate_events(timestamp DESC);
