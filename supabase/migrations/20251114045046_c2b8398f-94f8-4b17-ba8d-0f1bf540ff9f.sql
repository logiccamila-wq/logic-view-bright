-- Criar tabela de veículos se não existir
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placa text UNIQUE NOT NULL,
  tipo text NOT NULL, -- 'cavalo', 'carreta', 'truck'
  modelo text,
  ano integer,
  status text DEFAULT 'ativo',
  proprietario text, -- 'próprio' ou 'agregado'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar campos faltantes na tabela profiles se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'telefone') THEN
    ALTER TABLE public.profiles ADD COLUMN telefone text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cpf') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'rg') THEN
    ALTER TABLE public.profiles ADD COLUMN rg text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cidade') THEN
    ALTER TABLE public.profiles ADD COLUMN cidade text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'apelido') THEN
    ALTER TABLE public.profiles ADD COLUMN apelido text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'tipo_vinculo') THEN
    ALTER TABLE public.profiles ADD COLUMN tipo_vinculo text; -- 'próprio' ou 'agregado'
  END IF;
END $$;

-- Criar tabela de contas a pagar
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  fornecedor text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento timestamptz NOT NULL,
  data_pagamento timestamptz,
  status text DEFAULT 'pendente', -- 'pendente', 'pago', 'atrasado'
  categoria text, -- 'combustivel', 'manutencao', 'pedagio', etc
  observacoes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de contas a receber
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  cliente text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento timestamptz NOT NULL,
  data_recebimento timestamptz,
  status text DEFAULT 'pendente', -- 'pendente', 'recebido', 'atrasado'
  cte_id uuid REFERENCES public.cte(id),
  observacoes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver veículos"
ON public.vehicles FOR SELECT
USING (true);

CREATE POLICY "Gestores podem gerenciar veículos"
ON public.vehicles FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role) OR
  has_role(auth.uid(), 'fleet_maintenance'::app_role)
);

-- RLS para contas a pagar
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem ver contas a pagar"
ON public.contas_pagar FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role) OR
  has_role(auth.uid(), 'maintenance_manager'::app_role)
);

CREATE POLICY "Gestores podem gerenciar contas a pagar"
ON public.contas_pagar FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

-- RLS para contas a receber
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem ver contas a receber"
ON public.contas_receber FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role) OR
  has_role(auth.uid(), 'maintenance_manager'::app_role)
);

CREATE POLICY "Gestores podem gerenciar contas a receber"
ON public.contas_receber FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);