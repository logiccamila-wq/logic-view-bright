-- Criar tipos enum
CREATE TYPE public.tipo_vinculo AS ENUM ('CLT', 'SOCIO', 'CONSULTOR', 'PRESTADOR');
CREATE TYPE public.status_operacional AS ENUM ('ATIVO', 'FERIAS', 'AFASTADO');
CREATE TYPE public.tipo_jornada AS ENUM ('DIRIGINDO', 'PAUSA', 'DORMINDO', 'ESPERA');
CREATE TYPE public.trip_status AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- Tabela employees (funcionários)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT,
  cargo TEXT NOT NULL,
  tipo_vinculo tipo_vinculo NOT NULL DEFAULT 'CLT',
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  salario NUMERIC(10, 2),
  telefone TEXT,
  email TEXT,
  cidade TEXT,
  endereco TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela drivers (motoristas)
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  categoria_cnh TEXT NOT NULL,
  validade_cnh DATE NOT NULL,
  treinamento_mopp BOOLEAN DEFAULT false,
  aptidao_medica BOOLEAN DEFAULT false,
  status_operacional status_operacional DEFAULT 'ATIVO',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela driver_trips (viagens dos motoristas)
CREATE TABLE public.driver_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  vehicle_plate TEXT,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  status trip_status DEFAULT 'PLANEJADA',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela driver_journeys (jornadas dos motoristas)
CREATE TABLE public.driver_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  entrada TIMESTAMPTZ NOT NULL,
  saida TIMESTAMPTZ,
  tipo tipo_jornada NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela employee_expenses (despesas dos funcionários)
CREATE TABLE public.employee_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  data DATE NOT NULL,
  categoria TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela dre_entries (entradas do DRE)
CREATE TABLE public.dre_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
  valor NUMERIC(10, 2) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT,
  origem_id UUID,
  origem_tipo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para melhorar performance
CREATE INDEX idx_employees_cargo ON public.employees(cargo);
CREATE INDEX idx_employees_cpf ON public.employees(cpf);
CREATE INDEX idx_employees_data_admissao ON public.employees(data_admissao);
CREATE INDEX idx_drivers_employee_id ON public.drivers(employee_id);
CREATE INDEX idx_driver_trips_driver_id ON public.driver_trips(driver_id);
CREATE INDEX idx_driver_trips_data_inicio ON public.driver_trips(data_inicio);
CREATE INDEX idx_driver_journeys_driver_id ON public.driver_journeys(driver_id);
CREATE INDEX idx_employee_expenses_employee_id ON public.employee_expenses(employee_id);
CREATE INDEX idx_employee_expenses_data ON public.employee_expenses(data);
CREATE INDEX idx_dre_entries_data ON public.dre_entries(data);
CREATE INDEX idx_dre_entries_tipo ON public.dre_entries(tipo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_trips_updated_at BEFORE UPDATE ON public.driver_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_expenses_updated_at BEFORE UPDATE ON public.employee_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dre_entries_updated_at BEFORE UPDATE ON public.dre_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dre_entries ENABLE ROW LEVEL SECURITY;

-- Policies para employees
CREATE POLICY "Gestores podem gerenciar funcionários"
ON public.employees FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

-- Policies para drivers
CREATE POLICY "Gestores podem gerenciar motoristas"
ON public.drivers FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

CREATE POLICY "Motoristas podem ver seus próprios dados"
ON public.drivers FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Policies para driver_trips
CREATE POLICY "Gestores podem gerenciar viagens"
ON public.driver_trips FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

CREATE POLICY "Motoristas podem ver suas viagens"
ON public.driver_trips FOR SELECT
USING (
  driver_id IN (
    SELECT d.id FROM public.drivers d
    JOIN public.employees e ON e.id = d.employee_id
    WHERE e.user_id = auth.uid()
  )
);

-- Policies para driver_journeys
CREATE POLICY "Gestores podem gerenciar jornadas"
ON public.driver_journeys FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

CREATE POLICY "Motoristas podem criar e ver suas jornadas"
ON public.driver_journeys FOR INSERT
WITH CHECK (
  driver_id IN (
    SELECT d.id FROM public.drivers d
    JOIN public.employees e ON e.id = d.employee_id
    WHERE e.user_id = auth.uid()
  )
);

CREATE POLICY "Motoristas podem ver suas jornadas"
ON public.driver_journeys FOR SELECT
USING (
  driver_id IN (
    SELECT d.id FROM public.drivers d
    JOIN public.employees e ON e.id = d.employee_id
    WHERE e.user_id = auth.uid()
  )
);

-- Policies para employee_expenses
CREATE POLICY "Gestores podem gerenciar despesas"
ON public.employee_expenses FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

-- Policies para dre_entries
CREATE POLICY "Gestores podem gerenciar DRE"
ON public.dre_entries FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);