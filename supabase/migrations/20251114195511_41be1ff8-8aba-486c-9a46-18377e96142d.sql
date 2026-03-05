-- Função para criar automaticamente conta a receber quando CT-e for autorizado
CREATE OR REPLACE FUNCTION create_conta_receber_from_cte()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando o CT-e for autorizado, criar conta a receber
  IF NEW.status = 'autorizado' AND (OLD.status IS NULL OR OLD.status != 'autorizado') THEN
    INSERT INTO public.contas_receber (
      cte_id,
      cliente,
      descricao,
      valor,
      data_vencimento,
      status,
      created_by
    )
    VALUES (
      NEW.id,
      NEW.tomador_nome || ' - ' || NEW.tomador_cnpj,
      'CT-e ' || NEW.numero_cte || ' - ' || NEW.remetente_cidade || '/' || NEW.remetente_uf || ' → ' || NEW.destinatario_cidade || '/' || NEW.destinatario_uf,
      NEW.valor_total,
      COALESCE(NEW.data_vencimento, NEW.data_emissao + INTERVAL '30 days'),
      'pendente',
      NEW.created_by
    )
    ON CONFLICT (cte_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para automatizar criação de contas a receber
DROP TRIGGER IF EXISTS trigger_create_conta_receber ON public.cte;
CREATE TRIGGER trigger_create_conta_receber
  AFTER INSERT OR UPDATE ON public.cte
  FOR EACH ROW
  EXECUTE FUNCTION create_conta_receber_from_cte();

-- Adicionar constraint para garantir que cada CT-e só tem uma conta a receber
ALTER TABLE public.contas_receber
  DROP CONSTRAINT IF EXISTS contas_receber_cte_id_key;
  
ALTER TABLE public.contas_receber
  ADD CONSTRAINT contas_receber_cte_id_key UNIQUE (cte_id);