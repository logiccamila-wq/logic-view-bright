-- Corrigir função com search_path seguro
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;