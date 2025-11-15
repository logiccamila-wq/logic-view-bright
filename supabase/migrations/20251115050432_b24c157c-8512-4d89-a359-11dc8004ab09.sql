-- Criar tabela de MDF-e (Manifesto de Documentos Fiscais Eletrônicos)
CREATE TABLE IF NOT EXISTS public.mdfe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  numero_mdfe TEXT NOT NULL,
  serie TEXT NOT NULL DEFAULT '1',
  chave_acesso TEXT UNIQUE,
  protocolo_autorizacao TEXT,
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, autorizado, encerrado, cancelado, rejeitado
  
  -- Tipo e Modal
  tipo_emitente TEXT NOT NULL DEFAULT '1', -- 1=Prestador, 2=Transportador Carga Própria, 3=ETC
  tipo_transportador TEXT, -- 1=ETC, 2=TAC, 3=CTC
  modal TEXT NOT NULL DEFAULT '1', -- 1=Rodoviário, 2=Aéreo, 3=Aquaviário, 4=Ferroviário
  
  -- Emitente (Transportadora)
  emitente_cnpj TEXT NOT NULL,
  emitente_razao_social TEXT NOT NULL,
  emitente_nome_fantasia TEXT,
  emitente_ie TEXT,
  emitente_endereco TEXT,
  emitente_cidade TEXT,
  emitente_uf TEXT NOT NULL,
  emitente_cep TEXT,
  
  -- Percurso
  uf_inicio TEXT NOT NULL,
  uf_fim TEXT NOT NULL,
  ufs_percurso TEXT[], -- Array de UFs do percurso
  
  -- Veículos
  veiculo_tracao_placa TEXT NOT NULL,
  veiculo_tracao_uf TEXT NOT NULL,
  veiculo_tracao_rntrc TEXT,
  veiculo_tracao_tara INTEGER, -- em KG
  veiculo_tracao_capacidade_kg INTEGER,
  veiculo_tracao_capacidade_m3 NUMERIC(10,2),
  veiculo_tracao_tipo_rodado TEXT, -- 01=Truck, 02=Toco, 03=Cavalo, 04=VAN, 05=Utilitário, 06=Outros
  veiculo_tracao_tipo_carroceria TEXT, -- 00=Não aplicável, 01=Aberta, 02=Fechada/Baú, 03=Granelera, 04=Porta Container, 05=Sider
  
  -- Reboques/Carretas (JSON com array de veículos)
  veiculos_reboque JSONB DEFAULT '[]'::jsonb,
  
  -- Condutor(es) - Motorista(s)
  condutores JSONB DEFAULT '[]'::jsonb, -- Array com: {nome, cpf}
  
  -- Vale Pedágio
  vale_pedagio_cnpj_fornecedor TEXT,
  vale_pedagio_cnpj_pagador TEXT,
  vale_pedagio_numero_compra TEXT,
  vale_pedagio_valor NUMERIC(10,2),
  
  -- Totais
  peso_total_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_total_carga NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantidade_ctes INTEGER NOT NULL DEFAULT 0,
  quantidade_nfes INTEGER, -- Para carga própria
  
  -- CT-es vinculados
  ctes_vinculados JSONB DEFAULT '[]'::jsonb, -- Array de IDs dos CT-es
  
  -- Observações e dados adicionais
  observacoes TEXT,
  informacoes_complementares TEXT,
  
  -- Encerramento
  data_encerramento TIMESTAMP WITH TIME ZONE,
  uf_encerramento TEXT,
  municipio_encerramento TEXT,
  
  -- Controle
  trip_id UUID REFERENCES public.trips(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mdfe_numero ON public.mdfe(numero_mdfe);
CREATE INDEX idx_mdfe_chave_acesso ON public.mdfe(chave_acesso);
CREATE INDEX idx_mdfe_status ON public.mdfe(status);
CREATE INDEX idx_mdfe_trip_id ON public.mdfe(trip_id);
CREATE INDEX idx_mdfe_emitente_cnpj ON public.mdfe(emitente_cnpj);
CREATE INDEX idx_mdfe_veiculo_placa ON public.mdfe(veiculo_tracao_placa);
CREATE INDEX idx_mdfe_data_emissao ON public.mdfe(data_emissao);

-- Trigger para updated_at
CREATE TRIGGER update_mdfe_updated_at
  BEFORE UPDATE ON public.mdfe
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.mdfe ENABLE ROW LEVEL SECURITY;

-- Gestores podem ver todos os MDF-e
CREATE POLICY "Gestores podem ver MDF-e"
  ON public.mdfe
  FOR SELECT
  USING (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Gestores podem criar MDF-e
CREATE POLICY "Gestores podem criar MDF-e"
  ON public.mdfe
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Gestores podem atualizar MDF-e
CREATE POLICY "Gestores podem atualizar MDF-e"
  ON public.mdfe
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Motoristas podem ver seus MDF-e através das viagens
CREATE POLICY "Motoristas podem ver seus MDF-e"
  ON public.mdfe
  FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE driver_id = auth.uid()
    )
  );

COMMENT ON TABLE public.mdfe IS 'Manifesto de Documentos Fiscais Eletrônicos - MDF-e';
COMMENT ON COLUMN public.mdfe.veiculos_reboque IS 'Array JSON com reboques/carretas: [{placa, uf, rntrc, tara, capacidade_kg, tipo_carroceria}]';
COMMENT ON COLUMN public.mdfe.condutores IS 'Array JSON com condutores: [{nome, cpf}]';
COMMENT ON COLUMN public.mdfe.ctes_vinculados IS 'Array JSON com IDs dos CT-es vinculados ao MDF-e';