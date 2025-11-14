-- Criar tabela de ordens de coleta
CREATE TABLE IF NOT EXISTS public.ordem_coleta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ordem TEXT NOT NULL,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Fornecedor
  fornecedor_nome TEXT NOT NULL,
  fornecedor_cidade TEXT,
  fornecedor_uf TEXT,
  
  -- Transportadora
  transportadora_nome TEXT NOT NULL DEFAULT 'EJG TRANSPORTES LTDA',
  transportadora_cnpj TEXT NOT NULL DEFAULT '44185912000150',
  transportadora_cidade TEXT NOT NULL DEFAULT 'CABO DE SANTO AGOSTINHO',
  transportadora_uf TEXT NOT NULL DEFAULT 'PE',
  
  -- Destino/Cliente
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT NOT NULL,
  
  -- Motorista
  motorista_nome TEXT NOT NULL,
  motorista_telefone TEXT,
  
  -- Veículos
  placa_cavalo TEXT NOT NULL,
  placa_carreta TEXT,
  capacidade_carreta TEXT,
  
  -- Produto
  produto TEXT NOT NULL,
  
  -- Pedido
  pedido_venda TEXT,
  
  -- Assinatura
  assinatura_motorista TEXT,
  data_assinatura TIMESTAMP WITH TIME ZONE,
  
  -- Controle
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ordem_coleta ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Gestores podem ver ordens de coleta"
  ON public.ordem_coleta
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

CREATE POLICY "Gestores podem criar ordens de coleta"
  ON public.ordem_coleta
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

CREATE POLICY "Gestores podem atualizar ordens de coleta"
  ON public.ordem_coleta
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ordem_coleta_updated_at
  BEFORE UPDATE ON public.ordem_coleta
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_ordem_coleta_numero ON public.ordem_coleta(numero_ordem);
CREATE INDEX idx_ordem_coleta_status ON public.ordem_coleta(status);
CREATE INDEX idx_ordem_coleta_data ON public.ordem_coleta(data_emissao DESC);