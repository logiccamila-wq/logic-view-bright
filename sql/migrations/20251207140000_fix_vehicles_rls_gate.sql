-- Allow selecting vehicles with no owner (system vehicles)
DROP POLICY IF EXISTS vehicles_select_owner_or_org ON public.vehicles;

CREATE POLICY vehicles_select_owner_or_org ON public.vehicles
FOR SELECT
TO authenticated
USING (
  owner_id IS NULL
  OR owner_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.org_users ou
    WHERE ou.organization_id = vehicles.organization_id
      AND ou.user_id = (SELECT auth.uid())
  )
);

-- Create gate_events table
CREATE TABLE IF NOT EXISTS public.gate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate text, -- Can be linked to vehicles table or just text
  driver_name text,
  event_type text CHECK (event_type IN ('entry', 'exit')),
  odometer numeric,
  reason text,
  authorized_by text,
  is_visitor boolean DEFAULT false,
  visitor_vehicle_info text, -- Plate/Model for visitor
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.gate_events ENABLE ROW LEVEL SECURITY;

-- Policy for gate_events (allow all authenticated for now)
DROP POLICY IF EXISTS gate_events_all_authenticated ON public.gate_events;
CREATE POLICY gate_events_all_authenticated ON public.gate_events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
