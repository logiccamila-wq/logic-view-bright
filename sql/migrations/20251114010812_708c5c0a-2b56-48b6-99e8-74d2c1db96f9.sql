-- Criar tabela de lavagens
CREATE TABLE IF NOT EXISTS public.lavagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_plate TEXT NOT NULL,
  tipo_lavagem TEXT NOT NULL CHECK (tipo_lavagem IN ('simples', 'completa', 'interna', 'externa', 'pesado', 'especial')),
  km INTEGER NOT NULL,
  foto_antes TEXT,
  foto_depois TEXT,
  responsavel_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  observacoes TEXT,
  valor NUMERIC(10,2),
  data_agendada TIMESTAMP WITH TIME ZONE,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pneus
CREATE TABLE IF NOT EXISTS public.pneus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  medida TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('novo', 'recapado', 'usado')),
  status TEXT NOT NULL DEFAULT 'estoque' CHECK (status IN ('estoque', 'em_uso', 'manutencao', 'descarte', 'recapagem')),
  vehicle_plate TEXT,
  posicao TEXT CHECK (posicao IN ('dianteiro_esquerdo', 'dianteiro_direito', 'traseiro_esquerdo_externo', 'traseiro_esquerdo_interno', 'traseiro_direito_externo', 'traseiro_direito_interno', 'step', 'estepe')),
  km_instalacao INTEGER,
  km_atual INTEGER,
  vida_util_km INTEGER DEFAULT 80000,
  profundidade_sulco NUMERIC(4,2),
  pressao_recomendada NUMERIC(4,1),
  data_instalacao TIMESTAMP WITH TIME ZONE,
  data_compra TIMESTAMP WITH TIME ZONE,
  valor_compra NUMERIC(10,2),
  fornecedor TEXT,
  numero_fogo TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentações de pneus
CREATE TABLE IF NOT EXISTS public.movimentacao_pneus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pneu_id UUID NOT NULL REFERENCES public.pneus(id) ON DELETE CASCADE,
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('instalacao', 'remocao', 'rodizio', 'recapagem', 'conserto', 'descarte')),
  vehicle_plate_origem TEXT,
  vehicle_plate_destino TEXT,
  posicao_origem TEXT,
  posicao_destino TEXT,
  km_veiculo INTEGER,
  motivo TEXT NOT NULL,
  profundidade_sulco NUMERIC(4,2),
  observacoes TEXT,
  responsavel_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lavagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pneus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacao_pneus ENABLE ROW LEVEL SECURITY;

-- Policies para lavagens
CREATE POLICY "Mecânicos podem ver lavagens"
  ON public.lavagens FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mecânicos podem criar lavagens"
  ON public.lavagens FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mecânicos podem atualizar lavagens"
  ON public.lavagens FOR UPDATE
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Policies para pneus
CREATE POLICY "Mecânicos podem ver pneus"
  ON public.pneus FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mecânicos podem gerenciar pneus"
  ON public.pneus FOR ALL
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Policies para movimentação de pneus
CREATE POLICY "Mecânicos podem ver movimentações"
  ON public.movimentacao_pneus FOR SELECT
  USING (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Mecânicos podem registrar movimentações"
  ON public.movimentacao_pneus FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR 
    has_role(auth.uid(), 'maintenance_assistant'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lavagens_updated_at BEFORE UPDATE ON public.lavagens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pneus_updated_at BEFORE UPDATE ON public.pneus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();