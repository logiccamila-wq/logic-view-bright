-- Criar tabela de folha de pagamento
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  mes_referencia DATE NOT NULL,
  salario_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
  horas_extras NUMERIC(10, 2) DEFAULT 0,
  adicional_noturno NUMERIC(10, 2) DEFAULT 0,
  adicional_periculosidade NUMERIC(10, 2) DEFAULT 0,
  adicional_insalubridade NUMERIC(10, 2) DEFAULT 0,
  outros_adicionais NUMERIC(10, 2) DEFAULT 0,
  descontos NUMERIC(10, 2) DEFAULT 0,
  fgts NUMERIC(10, 2) DEFAULT 0,
  inss NUMERIC(10, 2) DEFAULT 0,
  irrf NUMERIC(10, 2) DEFAULT 0,
  total_bruto NUMERIC(10, 2) DEFAULT 0,
  total_liquido NUMERIC(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'paga')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, mes_referencia)
);

-- Índices
CREATE INDEX idx_payroll_employee_id ON public.payroll_records(employee_id);
CREATE INDEX idx_payroll_mes_referencia ON public.payroll_records(mes_referencia);
CREATE INDEX idx_payroll_status ON public.payroll_records(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_payroll_records_updated_at 
  BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem gerenciar folhas"
ON public.payroll_records FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'logistics_manager'::app_role)
);

CREATE POLICY "Funcionários podem ver sua própria folha"
ON public.payroll_records FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Função para gerar entrada no DRE quando folha for fechada
CREATE OR REPLACE FUNCTION create_dre_entry_from_payroll()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'fechada' AND (OLD.status IS NULL OR OLD.status != 'fechada') THEN
    INSERT INTO public.dre_entries (
      categoria,
      subcategoria,
      tipo,
      valor,
      data,
      descricao,
      origem_id,
      origem_tipo
    )
    VALUES (
      'Pessoal',
      'Folha de Pagamento',
      'DESPESA',
      NEW.total_liquido,
      NEW.mes_referencia,
      'Folha de pagamento - ' || TO_CHAR(NEW.mes_referencia, 'MM/YYYY'),
      NEW.id,
      'payroll'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_dre_from_payroll
  AFTER INSERT OR UPDATE ON public.payroll_records
  FOR EACH ROW
  EXECUTE FUNCTION create_dre_entry_from_payroll();