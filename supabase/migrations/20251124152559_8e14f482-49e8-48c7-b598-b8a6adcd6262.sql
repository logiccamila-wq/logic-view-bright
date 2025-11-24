-- Tabela: Plano de Contas (se não existir)
CREATE TABLE IF NOT EXISTS public.plano_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'imposto', 'custo', 'ativo', 'passivo')),
  classe TEXT,
  centro_custo_id UUID REFERENCES public.centros_custo(id) ON DELETE SET NULL,
  descricao TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para plano_contas
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'plano_contas' 
    AND policyname = 'Gestores podem gerenciar plano de contas'
  ) THEN
    CREATE POLICY "Gestores podem gerenciar plano de contas"
    ON public.plano_contas
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));
  END IF;
END $$;

-- Trigger para updated_at plano_contas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_plano_contas_updated_at'
  ) THEN
    CREATE TRIGGER update_plano_contas_updated_at
    BEFORE UPDATE ON public.plano_contas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Tabela: Lançamentos Financeiros (se não existir)
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  plano_contas_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL,
  centro_custo_id UUID REFERENCES public.centros_custo(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para lancamentos_financeiros
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lancamentos_financeiros' 
    AND policyname = 'Gestores podem gerenciar lançamentos'
  ) THEN
    CREATE POLICY "Gestores podem gerenciar lançamentos"
    ON public.lancamentos_financeiros
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'logistics_manager'::app_role));
  END IF;
END $$;

-- Inserir dados de exemplo em centros_custo
INSERT INTO public.centros_custo (codigo, nome, descricao, status) VALUES
('CC001', 'Administrativo', 'Centro de custo administrativo', 'ativo'),
('CC002', 'Operacional', 'Centro de custo operacional', 'ativo'),
('CC003', 'Comercial', 'Centro de custo comercial', 'ativo')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir dados de exemplo em plano_contas
INSERT INTO public.plano_contas (codigo, nome, tipo, classe, descricao, status) VALUES
('1.1.001', 'Faturamento Fretes', 'receita', 'Receitas Operacionais', 'Receita de fretes', 'ativo'),
('3.1.001', 'Salários', 'despesa', 'Despesas com Pessoal', 'Pagamento de salários', 'ativo'),
('3.1.002', 'Combustível', 'despesa', 'Despesas Operacionais', 'Combustível veículos', 'ativo'),
('3.1.003', 'Manutenção', 'despesa', 'Despesas Operacionais', 'Manutenção frota', 'ativo'),
('4.1.001', 'INSS', 'imposto', 'Impostos e Contribuições', 'INSS sobre folha', 'ativo'),
('4.1.002', 'FGTS', 'imposto', 'Impostos e Contribuições', 'FGTS', 'ativo')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir 3 registros de exemplo em folha_pagamento
DO $$
DECLARE
  v_emp1_id UUID;
  v_emp2_id UUID;
  v_emp3_id UUID;
BEGIN
  -- Funcionário 1: com férias
  SELECT id INTO v_emp1_id FROM public.employees WHERE cargo ILIKE '%motorista%' LIMIT 1;
  IF v_emp1_id IS NOT NULL THEN
    INSERT INTO public.folha_pagamento (funcionario_id, competencia, salario_base, horas_extras, descontos, beneficios, ferias, ferias_inicio, ferias_fim)
    VALUES (v_emp1_id, '2025-01', 3500.00, 200.00, 350.00, 500.00, true, '2025-02-01', '2025-02-28')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Funcionário 2: com promoção
  SELECT id INTO v_emp2_id FROM public.employees WHERE cargo ILIKE '%analista%' LIMIT 1;
  IF v_emp2_id IS NOT NULL THEN
    INSERT INTO public.folha_pagamento (funcionario_id, competencia, salario_base, horas_extras, descontos, beneficios, promocao, nova_funcao)
    VALUES (v_emp2_id, '2025-01', 2800.00, 0, 280.00, 400.00, true, 'Supervisor de Logística')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Funcionário 3: com exame periódico
  SELECT id INTO v_emp3_id FROM public.employees WHERE id NOT IN (v_emp1_id, v_emp2_id) LIMIT 1;
  IF v_emp3_id IS NOT NULL THEN
    INSERT INTO public.folha_pagamento (funcionario_id, competencia, salario_base, horas_extras, descontos, beneficios, exame_periodico)
    VALUES (v_emp3_id, '2025-01', 3200.00, 150.00, 320.00, 450.00, '2025-02-15')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;