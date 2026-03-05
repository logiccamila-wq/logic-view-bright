-- Seed modules and default admin permissions

INSERT INTO public.modules (key, name, description, category, enabled)
VALUES
  ('dashboard','Dashboard OptiLog','Visão geral operacional e KPIs','core', true),
  ('tms','TMS','Gestão de transporte e entregas','logistics', true),
  ('wms','WMS','Sistema de gestão de armazém','logistics', true),
  ('oms','OMS','Sistema de gestão de pedidos','operations', true),
  ('mechanic-hub','Hub Mecânico','Gestão de manutenção e oficina','maintenance', true),
  ('driver-app','App Motorista','Aplicativo para condutores','mobile', true),
  ('control-tower','Torre de Controle','Monitoramento centralizado','operations', true),
  ('crm','CRM','Gestão de relacionamento com cliente','business', true),
  ('erp','ERP','Planejamento de recursos empresariais','business', true),
  ('supergestor','Supergestor','Hub de IA para decisões operacionais e financeiras','operations', true),
  ('predictive-maintenance','Manutenção Preditiva','Previsões de manutenção por IA e risco de pneus','maintenance', true),
  ('drivers-management','Gestão de Motoristas','Cadastro, jornada, violações e histórico de viagens','operations', true),
  ('approvals','Aprovações','Fluxo de aprovações operacionais e financeiras','operations', true),
  ('logistics-kpi','KPIs de Logística','Indicadores de performance e custos por KM','operations', true),
  ('bank-reconciliation','Conciliação Bancária','Importação e conciliação de extratos bancários','finance', true),
  ('cost-monitoring','Monitoramento de Custos','Acompanhamento de despesas e otimização de custo/km','finance', true),
  ('iot','IoT','Telemetria de frota e sensores em tempo real','iot', true),
  ('permissions','Permissões','Perfis, papéis e autorização por módulo','operations', true),
  ('developer','Developer','Ferramentas para dev, logs e diagnósticos','dev', true),
  ('reports','Relatórios','Relatórios executivos e financeiros','business', true)
ON CONFLICT (key) DO NOTHING;

-- Default allow admin on all modules (ensure table exists)
INSERT INTO public.permissions (profile_key, module_key, allowed)
SELECT 'admin', m.key, true FROM public.modules m
ON CONFLICT (profile_key, module_key) DO NOTHING;

