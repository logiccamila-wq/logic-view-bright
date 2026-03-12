-- Criar tabela de metas de receita
CREATE TABLE public.revenue_targets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes integer NOT NULL,
  ano integer NOT NULL,
  target_value numeric NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(mes, ano)
);

-- Criar tabela de alertas preditivos
CREATE TABLE public.predictive_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  alert_name text NOT NULL,
  alert_type text NOT NULL,
  threshold_percentage numeric,
  check_target_miss boolean NOT NULL DEFAULT false,
  target_threshold_percentage numeric,
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

-- Criar tabela de histórico de alertas disparados
CREATE TABLE public.predictive_alert_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id uuid NOT NULL REFERENCES predictive_alerts(id) ON DELETE CASCADE,
  mes_previsto integer NOT NULL,
  ano_previsto integer NOT NULL,
  predicted_value numeric NOT NULL,
  target_value numeric,
  variance_percentage numeric NOT NULL,
  alert_reason text NOT NULL,
  notification_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.revenue_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for revenue_targets
CREATE POLICY "Managers can view revenue targets"
ON public.revenue_targets FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager')
);

CREATE POLICY "Managers can manage revenue targets"
ON public.revenue_targets FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager')
);

-- RLS Policies for predictive_alerts
CREATE POLICY "Managers can view predictive alerts"
ON public.predictive_alerts FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager')
);

CREATE POLICY "Managers can manage predictive alerts"
ON public.predictive_alerts FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager')
);

-- RLS Policies for predictive_alert_history
CREATE POLICY "Managers can view alert history"
ON public.predictive_alert_history FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'logistics_manager') OR 
  has_role(auth.uid(), 'maintenance_manager')
);

CREATE POLICY "System can insert alert history"
ON public.predictive_alert_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_revenue_targets_updated_at
BEFORE UPDATE ON public.revenue_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_predictive_alerts_updated_at
BEFORE UPDATE ON public.predictive_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();