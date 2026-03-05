-- Tabela de CTe (Conhecimento de Transporte Eletrônico)
CREATE TABLE IF NOT EXISTS public.cte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cte text NOT NULL UNIQUE,
  serie text NOT NULL DEFAULT '1',
  tipo_cte text NOT NULL CHECK (tipo_cte IN ('normal', 'complementar', 'anulacao', 'substituto')),
  tipo_servico text NOT NULL CHECK (tipo_servico IN ('normal', 'subcontratacao', 'redespacho', 'intermediario')),
  
  -- Vinculação com viagem
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  
  -- Dados do remetente
  remetente_nome text NOT NULL,
  remetente_cnpj text NOT NULL,
  remetente_endereco text NOT NULL,
  remetente_cidade text NOT NULL,
  remetente_uf text NOT NULL,
  remetente_cep text NOT NULL,
  
  -- Dados do destinatário
  destinatario_nome text NOT NULL,
  destinatario_cnpj text NOT NULL,
  destinatario_endereco text NOT NULL,
  destinatario_cidade text NOT NULL,
  destinatario_uf text NOT NULL,
  destinatario_cep text NOT NULL,
  
  -- Dados do tomador (quem paga o frete)
  tomador_tipo text NOT NULL CHECK (tomador_tipo IN ('remetente', 'destinatario', 'terceiro')),
  tomador_nome text,
  tomador_cnpj text,
  
  -- Dados da carga
  produto_predominante text NOT NULL,
  peso_bruto decimal(10,2) NOT NULL,
  peso_cubado decimal(10,2),
  quantidade_volumes integer NOT NULL,
  valor_mercadoria decimal(10,2) NOT NULL,
  
  -- Dados do frete
  modal text NOT NULL DEFAULT 'rodoviario' CHECK (modal IN ('rodoviario', 'aereo', 'aquaviario', 'ferroviario', 'dutoviario')),
  valor_frete decimal(10,2) NOT NULL,
  valor_pedagio decimal(10,2) DEFAULT 0,
  valor_total decimal(10,2) NOT NULL,
  tipo_frete text NOT NULL CHECK (tipo_frete IN ('cif', 'fob')),
  
  -- Dados do transporte
  placa_veiculo text NOT NULL,
  placa_carreta text,
  uf_veiculo text NOT NULL,
  rntrc text,
  
  -- Status e controle
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'emitido', 'autorizado', 'cancelado', 'rejeitado')),
  chave_acesso text UNIQUE,
  protocolo_autorizacao text,
  data_emissao timestamp with time zone DEFAULT now(),
  data_autorizacao timestamp with time zone,
  
  -- Observações
  observacoes text,
  
  -- Auditoria
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cte ENABLE ROW LEVEL SECURITY;

-- RLS Policies para CTe
CREATE POLICY "Logistics managers can view all CTe"
  ON public.cte FOR SELECT
  USING (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR 
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Logistics managers can create CTe"
  ON public.cte FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR 
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Logistics managers can update CTe"
  ON public.cte FOR UPDATE
  USING (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR 
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Drivers can view their CTe"
  ON public.cte FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE driver_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_cte_updated_at
  BEFORE UPDATE ON public.cte
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_cte_trip_id ON public.cte(trip_id);
CREATE INDEX idx_cte_status ON public.cte(status);
CREATE INDEX idx_cte_numero ON public.cte(numero_cte);
CREATE INDEX idx_cte_placa ON public.cte(placa_veiculo);