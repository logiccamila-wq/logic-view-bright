-- Adicionar campos de integração à tabela de alertas
ALTER TABLE public.maintenance_cost_alerts 
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_numbers TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS n8n_webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS n8n_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_channels TEXT[] DEFAULT ARRAY['email']::TEXT[];

-- Tabela para configurações de integração
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('whatsapp', 'n8n', 'zapier')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  
  -- Configurações específicas armazenadas como JSONB
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, integration_type)
);

-- RLS Policies para integration_settings
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view integrations"
  ON public.integration_settings FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager')
  );

CREATE POLICY "Admins and managers can manage integrations"
  ON public.integration_settings FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR 
    has_role(auth.uid(), 'maintenance_manager')
  );

-- Índices
CREATE INDEX idx_integration_settings_user_id ON public.integration_settings(user_id);
CREATE INDEX idx_integration_settings_type ON public.integration_settings(integration_type);

-- Trigger para updated_at
CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();