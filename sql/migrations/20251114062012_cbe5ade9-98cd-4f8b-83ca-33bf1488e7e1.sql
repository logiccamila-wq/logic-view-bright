-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  inscricao_estadual TEXT,
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  contato_principal TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  limite_credito NUMERIC DEFAULT 0,
  condicao_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela de análise financeira por cliente
CREATE TABLE IF NOT EXISTS public.client_financial_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_cnpj TEXT NOT NULL,
  periodo_mes INTEGER NOT NULL,
  periodo_ano INTEGER NOT NULL,
  total_ctes INTEGER NOT NULL DEFAULT 0,
  receita_total NUMERIC NOT NULL DEFAULT 0,
  receita_recebida NUMERIC NOT NULL DEFAULT 0,
  receita_pendente NUMERIC NOT NULL DEFAULT 0,
  receita_atrasada NUMERIC NOT NULL DEFAULT 0,
  ticket_medio NUMERIC NOT NULL DEFAULT 0,
  peso_total_kg NUMERIC NOT NULL DEFAULT 0,
  maior_atraso_dias INTEGER DEFAULT 0,
  inadimplente BOOLEAN NOT NULL DEFAULT false,
  score_cliente INTEGER DEFAULT 100,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_cnpj, periodo_mes, periodo_ano)
);

-- Criar tabela de alertas de inadimplência
CREATE TABLE IF NOT EXISTS public.payment_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_cnpj TEXT NOT NULL,
  cte_id UUID REFERENCES public.cte(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'media',
  dias_atraso INTEGER,
  valor_pendente NUMERIC NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_alerta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_cnpj ON public.clients(cnpj);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_financial_analysis_cnpj ON public.client_financial_analysis(client_cnpj);
CREATE INDEX IF NOT EXISTS idx_financial_analysis_periodo ON public.client_financial_analysis(periodo_ano, periodo_mes);
CREATE INDEX IF NOT EXISTS idx_payment_alerts_cnpj ON public.payment_alerts(client_cnpj);
CREATE INDEX IF NOT EXISTS idx_payment_alerts_status ON public.payment_alerts(status);

-- Adicionar campo de contas a receber à tabela CTE
ALTER TABLE public.cte ADD COLUMN IF NOT EXISTS data_vencimento TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.cte ADD COLUMN IF NOT EXISTS data_pagamento TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.cte ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente';

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_financial_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clients
CREATE POLICY "Gestores podem ver clientes"
  ON public.clients FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

CREATE POLICY "Gestores podem gerenciar clientes"
  ON public.clients FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role)
  );

-- Políticas RLS para análise financeira
CREATE POLICY "Gestores podem ver análises financeiras"
  ON public.client_financial_analysis FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

CREATE POLICY "Sistema pode gerenciar análises"
  ON public.client_financial_analysis FOR ALL
  USING (true);

-- Políticas RLS para alertas
CREATE POLICY "Gestores podem ver alertas"
  ON public.payment_alerts FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'operations'::app_role)
  );

CREATE POLICY "Gestores podem gerenciar alertas"
  ON public.payment_alerts FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular análise financeira automaticamente
CREATE OR REPLACE FUNCTION public.calculate_client_financial_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_record RECORD;
  current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Para cada tomador único nos CTes
  FOR client_record IN 
    SELECT DISTINCT tomador_cnpj as cnpj
    FROM public.cte
    WHERE tomador_cnpj IS NOT NULL
  LOOP
    -- Calcular métricas financeiras
    INSERT INTO public.client_financial_analysis (
      client_cnpj,
      periodo_mes,
      periodo_ano,
      total_ctes,
      receita_total,
      receita_recebida,
      receita_pendente,
      receita_atrasada,
      ticket_medio,
      peso_total_kg,
      maior_atraso_dias,
      inadimplente,
      score_cliente
    )
    SELECT
      client_record.cnpj,
      current_month,
      current_year,
      COUNT(*) as total_ctes,
      COALESCE(SUM(valor_total), 0) as receita_total,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pago' THEN valor_total ELSE 0 END), 0) as receita_recebida,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pendente' AND (data_vencimento IS NULL OR data_vencimento >= CURRENT_DATE) THEN valor_total ELSE 0 END), 0) as receita_pendente,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pendente' AND data_vencimento < CURRENT_DATE THEN valor_total ELSE 0 END), 0) as receita_atrasada,
      COALESCE(AVG(valor_total), 0) as ticket_medio,
      COALESCE(SUM(peso_bruto), 0) as peso_total_kg,
      COALESCE(MAX(CASE WHEN status_pagamento = 'pendente' AND data_vencimento IS NOT NULL 
        THEN EXTRACT(DAY FROM CURRENT_DATE - data_vencimento) 
        ELSE 0 END), 0)::INTEGER as maior_atraso_dias,
      EXISTS(
        SELECT 1 FROM public.cte c2 
        WHERE c2.tomador_cnpj = client_record.cnpj 
        AND c2.status_pagamento = 'pendente' 
        AND c2.data_vencimento < CURRENT_DATE - INTERVAL '30 days'
      ) as inadimplente,
      CASE 
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE - INTERVAL '60 days') THEN 30
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE - INTERVAL '30 days') THEN 60
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE) THEN 80
        ELSE 100
      END as score_cliente
    FROM public.cte
    WHERE tomador_cnpj = client_record.cnpj
    AND EXTRACT(MONTH FROM data_emissao) = current_month
    AND EXTRACT(YEAR FROM data_emissao) = current_year
    ON CONFLICT (client_cnpj, periodo_mes, periodo_ano) 
    DO UPDATE SET
      total_ctes = EXCLUDED.total_ctes,
      receita_total = EXCLUDED.receita_total,
      receita_recebida = EXCLUDED.receita_recebida,
      receita_pendente = EXCLUDED.receita_pendente,
      receita_atrasada = EXCLUDED.receita_atrasada,
      ticket_medio = EXCLUDED.ticket_medio,
      peso_total_kg = EXCLUDED.peso_total_kg,
      maior_atraso_dias = EXCLUDED.maior_atraso_dias,
      inadimplente = EXCLUDED.inadimplente,
      score_cliente = EXCLUDED.score_cliente,
      ultima_atualizacao = now();
  END LOOP;
END;
$$;