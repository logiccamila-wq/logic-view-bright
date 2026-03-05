-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    cpf TEXT,
    telefone TEXT,
    cidade TEXT,
    tipo_vinculo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- admin, driver, fleet_maintenance, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- 3. Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    placa TEXT UNIQUE NOT NULL,
    modelo TEXT,
    marca TEXT,
    ano INTEGER,
    tipo TEXT, -- cavalo, carreta, truck
    status TEXT DEFAULT 'ativo',
    chassi TEXT,
    renavam TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Drivers (may link to profiles)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    cnh TEXT,
    cnh_category TEXT,
    cnh_validity DATE,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Service Orders (Maintenance)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_plate TEXT NOT NULL, -- Link to vehicle by plate or FK
    status TEXT DEFAULT 'aberta', -- aberta, em_andamento, concluida, cancelada
    description TEXT,
    odometer INTEGER,
    labor_hours NUMERIC,
    parts_used JSONB DEFAULT '[]'::jsonb,
    vehicle_model TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Maintenance Cost Alerts
CREATE TABLE IF NOT EXISTS public.maintenance_cost_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_name TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- cost_threshold, trend_increase, vehicle_specific
    is_active BOOLEAN DEFAULT true,
    cost_threshold NUMERIC,
    period_days INTEGER,
    trend_percentage NUMERIC,
    trend_period_months INTEGER,
    vehicle_plate TEXT,
    email_enabled BOOLEAN DEFAULT false,
    email_recipients TEXT[] DEFAULT '{}',
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_numbers TEXT[] DEFAULT '{}',
    n8n_enabled BOOLEAN DEFAULT false,
    n8n_webhook_url TEXT,
    notification_channels TEXT[] DEFAULT '{}',
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Vehicle Tracking
CREATE TABLE IF NOT EXISTS public.vehicle_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_plate TEXT NOT NULL,
    driver_id TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    speed NUMERIC,
    heading NUMERIC,
    status TEXT, -- em_transito, parado, etc.
    trip_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Trips
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id),
    driver_name TEXT,
    vehicle_plate TEXT,
    origin TEXT,
    destination TEXT,
    status TEXT, -- aprovada, em_andamento, concluida, cancelada
    estimated_departure TIMESTAMP WITH TIME ZONE,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CTE (Conhecimento de Transporte Eletrônico)
CREATE TABLE IF NOT EXISTS public.cte (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id),
    numero_cte TEXT,
    status TEXT, -- emitido, autorizado, cancelado
    remetente_nome TEXT,
    remetente_cidade TEXT,
    remetente_uf TEXT,
    destinatario_nome TEXT,
    destinatario_cidade TEXT,
    destinatario_uf TEXT,
    produto_predominante TEXT,
    peso_bruto NUMERIC,
    quantidade_volumes INTEGER,
    valor_total NUMERIC,
    placa_veiculo TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- info, success, warning, error
    module TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Refuelings
CREATE TABLE IF NOT EXISTS public.refuelings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id),
    driver_id UUID REFERENCES public.profiles(id),
    vehicle_plate TEXT NOT NULL,
    km NUMERIC NOT NULL,
    liters NUMERIC NOT NULL,
    total_value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Maintenance Plans
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_item TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    interval_km INTEGER NOT NULL,
    tolerance_km INTEGER DEFAULT 500,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Driver Work Sessions
CREATE TABLE IF NOT EXISTS public.driver_work_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id),
    trip_id UUID REFERENCES public.trips(id),
    vehicle_plate TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    status TEXT,
    tipo_motorista TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Driver Work Events
CREATE TABLE IF NOT EXISTS public.driver_work_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.driver_work_sessions(id),
    driver_id UUID REFERENCES public.profiles(id),
    tipo_atividade TEXT,
    data_hora_inicio TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    automatico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Driver Violations
CREATE TABLE IF NOT EXISTS public.driver_violations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id),
    data_hora_violacao TIMESTAMP WITH TIME ZONE,
    descricao TEXT,
    valor_registrado NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Driver Weekly Reports
CREATE TABLE IF NOT EXISTS public.driver_weekly_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES public.profiles(id),
    ano INTEGER,
    semana INTEGER,
    total_horas NUMERIC,
    total_km NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Workshop Inventory
CREATE TABLE IF NOT EXISTS public.workshop_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    part_code TEXT UNIQUE,
    part_name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    warehouse_type TEXT DEFAULT 'workshop',
    quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5,
    critical_stock INTEGER DEFAULT 2,
    unit_price NUMERIC,
    supplier TEXT,
    location TEXT,
    barcode TEXT,
    notes TEXT,
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Inventory Movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.workshop_inventory(id),
    movement_type TEXT NOT NULL, -- entrada, saida, ajuste, transferencia
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_document TEXT,
    notes TEXT,
    responsible_user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Trip Macros (referenced in Driver.tsx)
CREATE TABLE IF NOT EXISTS public.trip_macros (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id),
    driver_id UUID REFERENCES public.profiles(id),
    macro_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refuelings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_work_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_macros ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for authenticated users for simplicity in dev)
-- In production, these should be more restrictive based on roles
CREATE POLICY "Enable read access for authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.profiles FOR UPDATE TO authenticated USING (true);

-- Repeat for other tables (simplified for this script, ideally detailed per table)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name != 'profiles' -- already done above
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all for authenticated" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Enable all for authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END
$$;
