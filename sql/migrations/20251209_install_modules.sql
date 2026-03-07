CREATE TABLE IF NOT EXISTS public.modules (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_key TEXT NOT NULL,
  module_key TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_key, module_key)
);

CREATE TABLE IF NOT EXISTS public.client_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_key TEXT NOT NULL,
  module_key TEXT NOT NULL,
  status TEXT DEFAULT 'installed',
  installed_at TIMESTAMPTZ DEFAULT now(),
  trial_end TIMESTAMPTZ,
  UNIQUE(client_key, module_key)
);

CREATE TABLE IF NOT EXISTS public.non_conformities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module TEXT,
  vehicle_plate TEXT,
  description TEXT,
  severity INTEGER,
  occurrence INTEGER,
  detection INTEGER,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions_select" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "client_modules_all" ON public.client_modules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "non_conformities_all" ON public.non_conformities FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.modules (key, name, description, category)
VALUES
  ('dashboard','Dashboard OptiLog','Visão geral operacional e KPIs','core'),
  ('tms','TMS','Gestão de transporte e entregas','logistics'),
  ('wms','WMS','Sistema de gestão de armazém','logistics'),
  ('oms','OMS','Sistema de gestão de pedidos','operations'),
  ('mechanic-hub','Hub Mecânico','Gestão de manutenção e oficina','maintenance'),
  ('driver-app','App Motorista','Aplicativo para condutores','mobile'),
  ('control-tower','Torre de Controle','Monitoramento centralizado','operations'),
  ('crm','CRM','Gestão de relacionamento com cliente','business'),
  ('erp','ERP','Planejamento de recursos empresariais','business'),
  ('supergestor','Supergestor','Hub de IA para decisões operacionais e financeiras','operations'),
  ('predictive-maintenance','Manutenção Preditiva','Previsões de manutenção por IA e risco de pneus','maintenance'),
  ('drivers-management','Gestão de Motoristas','Cadastro, jornada, violações e histórico de viagens','operations'),
  ('approvals','Aprovações','Fluxo de aprovações operacionais e financeiras','operations'),
  ('logistics-kpi','KPIs de Logística','Indicadores de performance e custos por KM','operations'),
  ('bank-reconciliation','Conciliação Bancária','Importação e conciliação de extratos bancários','finance'),
  ('cost-monitoring','Monitoramento de Custos','Acompanhamento de despesas e otimização de custo/km','finance'),
  ('iot','IoT','Telemetria de frota e sensores em tempo real','iot'),
  ('permissions','Permissões','Perfis, papéis e autorização por módulo','operations'),
  ('developer','Developer','Ferramentas para dev, logs e diagnósticos','dev'),
  ('reports','Relatórios','Relatórios executivos e financeiros','business')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_modules_updated_at BEFORE UPDATE ON public.client_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_non_conformities_updated_at BEFORE UPDATE ON public.non_conformities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
