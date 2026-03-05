-- Tabela para configurações de remuneração por empresa
CREATE TABLE driver_compensation_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salario_base numeric NOT NULL DEFAULT 3000.00,
  valor_hora_normal numeric NOT NULL DEFAULT 15.00,
  valor_hora_extra numeric NOT NULL DEFAULT 22.50, -- 50% a mais
  valor_hora_espera numeric NOT NULL DEFAULT 15.00,
  percentual_gratificacao numeric NOT NULL DEFAULT 0.03, -- 3%
  percentual_desconto_cte numeric NOT NULL DEFAULT 0.17, -- 17%
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela para cálculos de remuneração dos motoristas (visível apenas para gestores)
CREATE TABLE driver_payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id),
  mes integer NOT NULL,
  ano integer NOT NULL,
  
  -- Horas trabalhadas
  horas_normais numeric NOT NULL DEFAULT 0,
  horas_extras numeric NOT NULL DEFAULT 0,
  horas_espera numeric NOT NULL DEFAULT 0,
  
  -- Valores calculados
  valor_horas_normais numeric NOT NULL DEFAULT 0,
  valor_horas_extras numeric NOT NULL DEFAULT 0,
  valor_horas_espera numeric NOT NULL DEFAULT 0,
  salario_base numeric NOT NULL DEFAULT 0,
  
  -- Gratificações
  total_valor_ctes numeric NOT NULL DEFAULT 0,
  total_combustivel numeric NOT NULL DEFAULT 0,
  base_calculo_gratificacao numeric NOT NULL DEFAULT 0, -- valor_ctes - 17% - combustivel
  valor_gratificacao numeric NOT NULL DEFAULT 0, -- 3% da base
  
  -- Total
  total_bruto numeric NOT NULL DEFAULT 0,
  total_descontos numeric NOT NULL DEFAULT 0,
  total_liquido numeric NOT NULL DEFAULT 0,
  
  -- Dados adicionais
  dados_detalhados jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'calculado' CHECK (status IN ('calculado', 'aprovado', 'pago')),
  aprovado_por uuid REFERENCES auth.users(id),
  data_aprovacao timestamptz,
  data_pagamento timestamptz,
  observacoes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(driver_id, mes, ano)
);

-- Índices
CREATE INDEX idx_driver_payroll_driver ON driver_payroll(driver_id);
CREATE INDEX idx_driver_payroll_period ON driver_payroll(ano, mes);
CREATE INDEX idx_driver_payroll_status ON driver_payroll(status);

-- RLS Policies
ALTER TABLE driver_compensation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_payroll ENABLE ROW LEVEL SECURITY;

-- Apenas admins e gestores podem ver configurações
CREATE POLICY "Gestores podem ver configurações de remuneração"
  ON driver_compensation_config FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR
    has_role(auth.uid(), 'maintenance_manager')
  );

CREATE POLICY "Admins podem gerenciar configurações"
  ON driver_compensation_config FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Gestores podem ver folhas de pagamento completas
CREATE POLICY "Gestores podem ver folhas de pagamento"
  ON driver_payroll FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager') OR
    has_role(auth.uid(), 'maintenance_manager')
  );

-- Gestores podem criar e atualizar folhas
CREATE POLICY "Gestores podem gerenciar folhas de pagamento"
  ON driver_payroll FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'logistics_manager')
  );

-- Motoristas NÃO podem ver a tabela completa de payroll
-- Eles verão apenas gratificação através de uma view separada

-- View para motoristas verem apenas gratificação
CREATE VIEW driver_gratification AS
SELECT 
  dp.id,
  dp.driver_id,
  dp.mes,
  dp.ano,
  dp.total_valor_ctes,
  dp.total_combustivel,
  dp.base_calculo_gratificacao,
  dp.valor_gratificacao,
  dp.status,
  dp.data_pagamento,
  dp.created_at
FROM driver_payroll dp;

-- RLS para a view
ALTER VIEW driver_gratification SET (security_invoker = true);

-- Inserir configuração padrão
INSERT INTO driver_compensation_config (
  salario_base,
  valor_hora_normal,
  valor_hora_extra,
  valor_hora_espera,
  percentual_gratificacao,
  percentual_desconto_cte
) VALUES (
  3000.00,
  15.00,
  22.50,
  15.00,
  0.03,
  0.17
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_driver_compensation_config_updated_at
  BEFORE UPDATE ON driver_compensation_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_payroll_updated_at
  BEFORE UPDATE ON driver_payroll
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();