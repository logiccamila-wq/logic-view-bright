-- Migration to fix missing tables and columns

-- 1. Fix user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Ensure 'role' column exists if table already existed with different schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'role') THEN
    ALTER TABLE public.user_roles ADD COLUMN role TEXT;
  END IF;
END $$;

-- 2. Create workshop_inventory table
CREATE TABLE IF NOT EXISTS public.workshop_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name TEXT NOT NULL,
  part_code TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'unidade',
  min_quantity NUMERIC DEFAULT 5,
  location TEXT,
  cost_price NUMERIC(10,2),
  sell_price NUMERIC(10,2),
  category TEXT,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create pneus table
CREATE TABLE IF NOT EXISTS public.pneus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT,
  model TEXT,
  size TEXT,
  serial_number TEXT,
  dot TEXT,
  status TEXT DEFAULT 'estoque', -- estoque, em_uso, reforma, descarte
  condition TEXT DEFAULT 'novo', -- novo, usado, recapado
  location TEXT DEFAULT 'estoque',
  vehicle_plate TEXT,
  position TEXT, -- e.g., 'eixo1_esq', 'eixo1_dir'
  current_tread_depth NUMERIC,
  original_tread_depth NUMERIC,
  purchase_date DATE,
  cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create movimentacao_pneus table
CREATE TABLE IF NOT EXISTS public.movimentacao_pneus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pneu_id UUID REFERENCES public.pneus(id),
  movement_type TEXT NOT NULL, -- instalacao, remocao, rodizio, reparo, reforma
  date TIMESTAMPTZ DEFAULT NOW(),
  vehicle_plate TEXT,
  position TEXT,
  odometer INTEGER,
  cost NUMERIC(10,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create lavagens table
CREATE TABLE IF NOT EXISTS public.lavagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  type TEXT, -- simples, completa, motor, chassi
  provider TEXT,
  cost NUMERIC(10,2),
  status TEXT DEFAULT 'concluido',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create parts_requests table (if not exists)
CREATE TABLE IF NOT EXISTS public.parts_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id UUID REFERENCES auth.users(id),
  mechanic_name TEXT,
  vehicle_plate TEXT,
  parts_list JSONB DEFAULT '[]',
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pendente', -- pendente, aprovado, rejeitado, comprado, entregue
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacao_pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lavagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;

-- Create basic permissive policies (adjust as needed for stricter security later)
CREATE POLICY "Allow read access to all authenticated users" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON public.workshop_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON public.pneus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON public.movimentacao_pneus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON public.lavagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to all authenticated users" ON public.parts_requests FOR SELECT TO authenticated USING (true);

-- Allow write access for authenticated users (simplified for now to fix errors)
CREATE POLICY "Allow write access to authenticated users" ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to authenticated users" ON public.workshop_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to authenticated users" ON public.pneus FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to authenticated users" ON public.movimentacao_pneus FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to authenticated users" ON public.lavagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access to authenticated users" ON public.parts_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
