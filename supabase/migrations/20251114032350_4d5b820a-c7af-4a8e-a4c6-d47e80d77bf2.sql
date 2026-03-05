-- Tabela de configurações de alertas de custos
CREATE TABLE IF NOT EXISTS public.maintenance_cost_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('cost_threshold', 'trend_increase', 'vehicle_specific')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Configurações de threshold
  cost_threshold NUMERIC,
  period_days INTEGER DEFAULT 30,
  
  -- Configurações de tendência
  trend_percentage NUMERIC,
  trend_period_months INTEGER DEFAULT 3,
  
  -- Filtros
  vehicle_plate TEXT,
  
  -- Notificações
  email_enabled BOOLEAN DEFAULT true,
  email_recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadados
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.maintenance_cost_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view cost alerts"
  ON public.maintenance_cost_alerts FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager') OR
    has_role(auth.uid(), 'fleet_maintenance')
  );

CREATE POLICY "Admins and managers can create cost alerts"
  ON public.maintenance_cost_alerts FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager')
  );

CREATE POLICY "Admins and managers can update cost alerts"
  ON public.maintenance_cost_alerts FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager')
  );

CREATE POLICY "Admins and managers can delete cost alerts"
  ON public.maintenance_cost_alerts FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager')
  );

-- Índices para performance
CREATE INDEX idx_maintenance_cost_alerts_user_id ON public.maintenance_cost_alerts(user_id);
CREATE INDEX idx_maintenance_cost_alerts_active ON public.maintenance_cost_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_maintenance_cost_alerts_vehicle ON public.maintenance_cost_alerts(vehicle_plate) WHERE vehicle_plate IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER update_maintenance_cost_alerts_updated_at
  BEFORE UPDATE ON public.maintenance_cost_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();