-- 1. Primeiro, atualizar valores antigos para CLT
UPDATE profiles SET tipo_vinculo = 'CLT' WHERE tipo_vinculo IN ('AGREGADO', 'PRÓPRIO');

-- 2. Criar enum de tipos de vínculo
CREATE TYPE tipo_vinculo_enum AS ENUM (
  'CLT',
  'PJ',
  'SOCIO',
  'CONSULTOR',
  'ESTAGIARIO',
  'TERCEIRIZADO'
);

-- 3. Atualizar coluna tipo_vinculo na tabela profiles
ALTER TABLE profiles 
ALTER COLUMN tipo_vinculo TYPE tipo_vinculo_enum 
USING tipo_vinculo::tipo_vinculo_enum;

-- 4. Corrigir vínculos específicos
UPDATE profiles SET tipo_vinculo = 'CONSULTOR' WHERE email = 'logiccamila@gmail.com';
UPDATE profiles SET tipo_vinculo = 'SOCIO' WHERE email = 'enio.gomes@ejgtransporte.com.br';
UPDATE profiles SET tipo_vinculo = 'SOCIO' WHERE email = 'jailson.barros@ejgtransporte.com.br';

-- 5. Criar tabela de sócios
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cnpj_cpf TEXT NOT NULL,
  razao_social TEXT,
  participacao_percentual NUMERIC(5,2) NOT NULL,
  tipo_participacao TEXT DEFAULT 'quotista',
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  data_saida TIMESTAMP WITH TIME ZONE,
  valor_capital_social NUMERIC(15,2),
  prolabore_mensal NUMERIC(10,2),
  status TEXT DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar sócios"
ON partners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));

CREATE POLICY "Sócios podem ver seus dados"
ON partners FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- 6. Criar tabela de distribuições
CREATE TABLE partner_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  periodo_mes INTEGER NOT NULL,
  periodo_ano INTEGER NOT NULL,
  tipo_distribuicao TEXT NOT NULL,
  valor_bruto NUMERIC(15,2) NOT NULL,
  valor_liquido NUMERIC(15,2) NOT NULL,
  impostos_retidos NUMERIC(15,2) DEFAULT 0,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE partner_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar distribuições"
ON partner_distributions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));

-- 7. Criar tabela de contas bancárias
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_conta TEXT NOT NULL,
  banco_codigo TEXT NOT NULL,
  banco_nome TEXT NOT NULL,
  agencia TEXT NOT NULL,
  conta TEXT NOT NULL,
  tipo_conta TEXT DEFAULT 'corrente',
  saldo_inicial NUMERIC(15,2) DEFAULT 0,
  saldo_atual NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'ativa',
  cnpj_titular TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar contas bancárias"
ON bank_accounts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));

-- 8. Criar tabela de transações bancárias
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
  data_transacao TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_transacao TEXT NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  descricao TEXT NOT NULL,
  documento TEXT,
  categoria TEXT,
  saldo_apos_transacao NUMERIC(15,2),
  conciliado BOOLEAN DEFAULT false,
  conta_pagar_id UUID REFERENCES contas_pagar(id),
  conta_receber_id UUID REFERENCES contas_receber(id),
  importacao_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar transações"
ON bank_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));

-- 9. Criar tabela de importações bancárias
CREATE TABLE bank_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID REFERENCES bank_accounts(id),
  arquivo_nome TEXT NOT NULL,
  formato TEXT NOT NULL,
  periodo_inicio DATE,
  periodo_fim DATE,
  total_transacoes INTEGER DEFAULT 0,
  total_conciliadas INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processando',
  erro_detalhes TEXT,
  imported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE bank_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem ver importações"
ON bank_imports FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));

-- 10. Criar trigger para atualizar saldo de contas
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bank_accounts
    SET saldo_atual = saldo_atual + 
      CASE 
        WHEN NEW.tipo_transacao = 'credito' THEN NEW.valor
        ELSE -NEW.valor
      END
    WHERE id = NEW.bank_account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance
AFTER INSERT ON bank_transactions
FOR EACH ROW
EXECUTE FUNCTION update_bank_account_balance();