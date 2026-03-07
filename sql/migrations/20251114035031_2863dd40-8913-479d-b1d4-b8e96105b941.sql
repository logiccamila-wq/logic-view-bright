-- Criar tabela de receitas e faturamento
CREATE TABLE public.revenue_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cte_chave text UNIQUE,
  numero_cte text NOT NULL,
  data_emissao timestamp with time zone NOT NULL,
  cliente_cnpj text NOT NULL,
  cliente_nome text NOT NULL,
  cliente_uf text NOT NULL,
  destinatario_cnpj text,
  destinatario_nome text,
  destinatario_uf text,
  valor_frete numeric NOT NULL DEFAULT 0,
  valor_mercadoria numeric NOT NULL DEFAULT 0,
  valor_icms numeric NOT NULL DEFAULT 0,
  peso_kg numeric NOT NULL DEFAULT 0,
  volumes integer NOT NULL DEFAULT 0,
  origem_uf text NOT NULL,
  destino_uf text NOT NULL,
  status text NOT NULL DEFAULT 'ativo',
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Criar tabela de indicadores financeiros
CREATE TABLE public.financial_indicators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_mes integer NOT NULL,
  periodo_ano integer NOT NULL,
  receita_total numeric NOT NULL DEFAULT 0,
  custo_total numeric NOT NULL DEFAULT 0,
  margem_liquida numeric NOT NULL DEFAULT 0,
  ticket_medio numeric NOT NULL DEFAULT 0,
  total_ctes integer NOT NULL DEFAULT 0,
  total_clientes integer NOT NULL DEFAULT 0,
  peso_total_kg numeric NOT NULL DEFAULT 0,
  receita_por_kg numeric NOT NULL DEFAULT 0,
  top_cliente_cnpj text,
  top_cliente_valor numeric NOT NULL DEFAULT 0,
  top_rota_origem text,
  top_rota_destino text,
  top_rota_valor numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(periodo_mes, periodo_ano)
);

-- Criar tabela de alertas de receita
CREATE TABLE public.revenue_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  alert_name text NOT NULL,
  alert_type text NOT NULL,
  threshold_value numeric,
  threshold_percentage numeric,
  comparison_period text NOT NULL DEFAULT 'mes_anterior',
  is_active boolean NOT NULL DEFAULT true,
  notification_channels text[] NOT NULL DEFAULT ARRAY[]::text[],
  email_recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  whatsapp_numbers text[] NOT NULL DEFAULT ARRAY[]::text[],
  n8n_enabled boolean NOT NULL DEFAULT false,
  n8n_webhook_url text,
  last_triggered_at timestamp with time zone,
  trigger_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revenue_records
CREATE POLICY "Managers and admins can view revenue records"
ON public.revenue_records FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager') OR
  has_role(auth.uid(), 'operations')
);

CREATE POLICY "Managers and admins can insert revenue records"
ON public.revenue_records FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR
  has_role(auth.uid(), 'operations')
);

CREATE POLICY "Managers and admins can update revenue records"
ON public.revenue_records FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR
  has_role(auth.uid(), 'operations')
);

-- RLS Policies for financial_indicators
CREATE POLICY "Managers and admins can view financial indicators"
ON public.financial_indicators FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager') OR
  has_role(auth.uid(), 'operations')
);

CREATE POLICY "Admins can manage financial indicators"
ON public.financial_indicators FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for revenue_alerts
CREATE POLICY "Managers can view revenue alerts"
ON public.revenue_alerts FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager')
);

CREATE POLICY "Managers can manage revenue alerts"
ON public.revenue_alerts FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager')
);

-- Create trigger for updated_at
CREATE TRIGGER update_revenue_records_updated_at
BEFORE UPDATE ON public.revenue_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_indicators_updated_at
BEFORE UPDATE ON public.financial_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_alerts_updated_at
BEFORE UPDATE ON public.revenue_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();