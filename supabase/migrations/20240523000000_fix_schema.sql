-- Create vehicles table if not exists
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate TEXT NOT NULL UNIQUE,
    model TEXT,
    brand TEXT,
    year INTEGER,
    type TEXT,
    status TEXT DEFAULT 'ativo',
    mileage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed vehicles if empty
INSERT INTO public.vehicles (plate, model, brand, year, type, status, mileage)
SELECT 'ABC-1234', 'Actros 2651', 'Mercedes-Benz', 2022, 'cavalo', 'ativo', 150000
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles);

INSERT INTO public.vehicles (plate, model, brand, year, type, status, mileage)
SELECT 'DEF-5678', 'FH 540', 'Volvo', 2023, 'cavalo', 'ativo', 85000
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE plate = 'DEF-5678');

INSERT INTO public.vehicles (plate, model, brand, year, type, status, mileage)
SELECT 'GHI-9012', 'R 450', 'Scania', 2021, 'cavalo', 'manutencao', 210000
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE plate = 'GHI-9012');

-- Create maintenance_cost_alerts
CREATE TABLE IF NOT EXISTS public.maintenance_cost_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_name TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    cost_threshold NUMERIC,
    period_days INTEGER,
    trend_percentage NUMERIC,
    trend_period_months INTEGER,
    vehicle_plate TEXT,
    email_enabled BOOLEAN DEFAULT false,
    email_recipients TEXT[],
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_numbers TEXT[],
    n8n_enabled BOOLEAN DEFAULT false,
    n8n_webhook_url TEXT,
    notification_channels TEXT[],
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create service_orders
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate TEXT NOT NULL,
    vehicle_model TEXT,
    status TEXT DEFAULT 'aberta',
    odometer INTEGER,
    labor_hours NUMERIC DEFAULT 0,
    parts_used JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vehicle_tracking
CREATE TABLE IF NOT EXISTS public.vehicle_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_plate TEXT NOT NULL,
    driver_id TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    speed NUMERIC,
    heading NUMERIC,
    status TEXT,
    trip_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create maintenance_plans
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_type TEXT NOT NULL,
    plan_item TEXT NOT NULL,
    interval_km INTEGER NOT NULL,
    tolerance_km INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_roles if not exists (or ensure columns)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);
