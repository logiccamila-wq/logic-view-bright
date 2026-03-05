-- Create gate_events table for vehicle entry/exit records

CREATE TABLE IF NOT EXISTS public.gate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate TEXT NOT NULL,
  driver_name TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('entry','exit')),
  odometer INTEGER,
  reason TEXT,
  authorized_by TEXT,
  is_visitor BOOLEAN DEFAULT false,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid()
);

-- Enable RLS and add permissive policies for now
ALTER TABLE public.gate_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gate_events_all_authenticated" ON public.gate_events;
CREATE POLICY "gate_events_all_authenticated" ON public.gate_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
