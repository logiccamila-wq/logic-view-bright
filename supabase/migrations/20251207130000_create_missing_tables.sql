
-- Migration to create missing tables and fix schema issues

-- 1. Create maintenance_cost_alerts table
CREATE TABLE IF NOT EXISTS public.maintenance_cost_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate text,
    alert_type text NOT NULL, -- 'cost_threshold' or 'trend_spike'
    cost_threshold numeric,
    period_days integer,
    trend_percentage numeric,
    trend_period_months integer,
    email_enabled boolean DEFAULT false,
    email_recipients text[], -- Array of email strings
    whatsapp_enabled boolean DEFAULT false,
    whatsapp_numbers text[],
    n8n_enabled boolean DEFAULT false,
    n8n_webhook_url text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- RLS for maintenance_cost_alerts
ALTER TABLE public.maintenance_cost_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts" ON public.maintenance_cost_alerts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert alerts" ON public.maintenance_cost_alerts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update alerts" ON public.maintenance_cost_alerts
    FOR UPDATE TO authenticated USING (true);

-- 2. Create service_orders table
CREATE TABLE IF NOT EXISTS public.service_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate text NOT NULL,
    vehicle_model text,
    issue_description text,
    odometer numeric,
    priority text, -- 'low', 'medium', 'high', 'critical'
    status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    mechanic_id uuid REFERENCES auth.users(id),
    opened_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS for service_orders
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service orders" ON public.service_orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert service orders" ON public.service_orders
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update service orders" ON public.service_orders
    FOR UPDATE TO authenticated USING (true);

-- 3. Create vehicle_tracking table
CREATE TABLE IF NOT EXISTS public.vehicle_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    heading double precision,
    speed double precision,
    status text, -- 'moving', 'stopped', 'idle'
    timestamp timestamptz DEFAULT now(),
    driver_id uuid REFERENCES auth.users(id),
    trip_id uuid, -- Optional FK to trips if exists
    created_at timestamptz DEFAULT now()
);

-- RLS for vehicle_tracking
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tracking" ON public.vehicle_tracking
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tracking" ON public.vehicle_tracking
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Create maintenance_checklists if not exists
CREATE TABLE IF NOT EXISTS public.maintenance_checklists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate text NOT NULL,
    checklist_type text, -- 'pre_trip', 'preventive', 'corrective'
    mechanic_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'pending',
    items jsonb, -- Store checklist items as JSON
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- RLS for maintenance_checklists
ALTER TABLE public.maintenance_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checklists" ON public.maintenance_checklists
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert checklists" ON public.maintenance_checklists
    FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Create driver_work_sessions if not exists
CREATE TABLE IF NOT EXISTS public.driver_work_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id uuid REFERENCES auth.users(id),
    vehicle_plate text,
    start_time timestamptz DEFAULT now(),
    end_time timestamptz,
    status text DEFAULT 'active', -- 'active', 'completed'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS for driver_work_sessions
ALTER TABLE public.driver_work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own sessions" ON public.driver_work_sessions
    FOR SELECT TO authenticated USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert sessions" ON public.driver_work_sessions
    FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update own sessions" ON public.driver_work_sessions
    FOR UPDATE TO authenticated USING (driver_id = auth.uid());

-- 6. Create driver_work_events if not exists
CREATE TABLE IF NOT EXISTS public.driver_work_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.driver_work_sessions(id),
    driver_id uuid REFERENCES auth.users(id),
    tipo_atividade text, -- 'trabalho', 'espera', 'descanso', 'refeicao'
    data_hora_inicio timestamptz NOT NULL,
    data_hora_fim timestamptz,
    observacoes text,
    automatico boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- RLS for driver_work_events
ALTER TABLE public.driver_work_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own events" ON public.driver_work_events
    FOR SELECT TO authenticated USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert events" ON public.driver_work_events
    FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update own events" ON public.driver_work_events
    FOR UPDATE TO authenticated USING (driver_id = auth.uid());

