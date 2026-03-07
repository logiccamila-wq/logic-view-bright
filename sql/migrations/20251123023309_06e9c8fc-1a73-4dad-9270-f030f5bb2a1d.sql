-- Corrigir search_path nas funções para segurança

-- Recriar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar função create_dre_entry_from_payroll com search_path
CREATE OR REPLACE FUNCTION public.create_dre_entry_from_payroll()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;