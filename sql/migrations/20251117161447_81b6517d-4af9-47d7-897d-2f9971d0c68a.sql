-- Fix database functions to set explicit search_path for security
-- First drop functions that need return type changes, then recreate with correct security settings

-- Drop and recreate create_or_update_director function
DROP FUNCTION IF EXISTS public.create_or_update_director(text, text, text);

CREATE FUNCTION public.create_or_update_director(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
  v_result jsonb;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Hash password
  v_encrypted_password := crypt(p_password, gen_salt('bf'));

  IF v_user_id IS NULL THEN
    -- Create new user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      v_encrypted_password,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_user_id, p_email, p_full_name);

    -- Assign director role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'director');

    v_result := jsonb_build_object(
      'success', true,
      'user_id', v_user_id,
      'message', 'Diretor criado com sucesso'
    );
  ELSE
    -- Update existing user
    UPDATE auth.users
    SET encrypted_password = v_encrypted_password,
        raw_user_meta_data = jsonb_build_object('full_name', p_full_name),
        updated_at = now()
    WHERE id = v_user_id;

    -- Update profile
    UPDATE public.profiles
    SET full_name = p_full_name,
        updated_at = now()
    WHERE id = v_user_id;

    -- Ensure director role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'director')
    ON CONFLICT (user_id, role) DO NOTHING;

    v_result := jsonb_build_object(
      'success', true,
      'user_id', v_user_id,
      'message', 'Diretor atualizado com sucesso'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Recreate other functions with search_path set
CREATE OR REPLACE FUNCTION public.calculate_client_financial_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_record RECORD;
  current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  FOR client_record IN 
    SELECT DISTINCT tomador_cnpj as cnpj
    FROM public.cte
    WHERE tomador_cnpj IS NOT NULL
  LOOP
    INSERT INTO public.client_financial_analysis (
      client_cnpj,
      periodo_mes,
      periodo_ano,
      total_ctes,
      receita_total,
      receita_recebida,
      receita_pendente,
      receita_atrasada,
      ticket_medio,
      peso_total_kg,
      maior_atraso_dias,
      inadimplente,
      score_cliente
    )
    SELECT
      client_record.cnpj,
      current_month,
      current_year,
      COUNT(*) as total_ctes,
      COALESCE(SUM(valor_total), 0) as receita_total,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pago' THEN valor_total ELSE 0 END), 0) as receita_recebida,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pendente' AND (data_vencimento IS NULL OR data_vencimento >= CURRENT_DATE) THEN valor_total ELSE 0 END), 0) as receita_pendente,
      COALESCE(SUM(CASE WHEN status_pagamento = 'pendente' AND data_vencimento < CURRENT_DATE THEN valor_total ELSE 0 END), 0) as receita_atrasada,
      COALESCE(AVG(valor_total), 0) as ticket_medio,
      COALESCE(SUM(peso_bruto), 0) as peso_total_kg,
      COALESCE(MAX(CASE WHEN status_pagamento = 'pendente' AND data_vencimento IS NOT NULL 
        THEN EXTRACT(DAY FROM CURRENT_DATE - data_vencimento) 
        ELSE 0 END), 0)::INTEGER as maior_atraso_dias,
      EXISTS(
        SELECT 1 FROM public.cte c2 
        WHERE c2.tomador_cnpj = client_record.cnpj 
        AND c2.status_pagamento = 'pendente' 
        AND c2.data_vencimento < CURRENT_DATE - INTERVAL '30 days'
      ) as inadimplente,
      CASE 
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE - INTERVAL '60 days') THEN 30
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE - INTERVAL '30 days') THEN 60
        WHEN EXISTS(SELECT 1 FROM public.cte c3 WHERE c3.tomador_cnpj = client_record.cnpj AND c3.status_pagamento = 'pendente' AND c3.data_vencimento < CURRENT_DATE) THEN 80
        ELSE 100
      END as score_cliente
    FROM public.cte
    WHERE tomador_cnpj = client_record.cnpj
    AND EXTRACT(MONTH FROM data_emissao) = current_month
    AND EXTRACT(YEAR FROM data_emissao) = current_year
    ON CONFLICT (client_cnpj, periodo_mes, periodo_ano) 
    DO UPDATE SET
      total_ctes = EXCLUDED.total_ctes,
      receita_total = EXCLUDED.receita_total,
      receita_recebida = EXCLUDED.receita_recebida,
      receita_pendente = EXCLUDED.receita_pendente,
      receita_atrasada = EXCLUDED.receita_atrasada,
      ticket_medio = EXCLUDED.ticket_medio,
      peso_total_kg = EXCLUDED.peso_total_kg,
      maior_atraso_dias = EXCLUDED.maior_atraso_dias,
      inadimplente = EXCLUDED.inadimplente,
      score_cliente = EXCLUDED.score_cliente,
      ultima_atualizacao = now();
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_conta_receber_from_cte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
$$;

CREATE OR REPLACE FUNCTION public.update_bank_account_balance()
RETURNS trigger
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