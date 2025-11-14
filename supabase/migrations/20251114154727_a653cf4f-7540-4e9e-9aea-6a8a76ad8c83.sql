-- Atualizar função para verificar e criar perfil apenas se necessário
CREATE OR REPLACE FUNCTION create_or_update_director(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Verificar se usuário já existe
  SELECT id INTO existing_user_id FROM auth.users WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- Usuário existe, atualizar perfil se necessário
    UPDATE public.profiles 
    SET full_name = user_full_name,
        updated_at = NOW()
    WHERE id = existing_user_id;
    
    -- Garantir que tem role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN existing_user_id;
  ELSE
    -- Criar novo usuário
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', user_full_name)::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Criar perfil
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new_user_id, user_email, user_full_name)
    ON CONFLICT (id) DO UPDATE SET full_name = user_full_name;

    -- Atribuir role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN new_user_id;
  END IF;
END;
$$;

-- Criar/atualizar diretores
DO $$
BEGIN
  -- Diretor Financeiro
  PERFORM create_or_update_director(
    'jailson.barros@ejgtransporte.com.br',
    'financeiro123',
    'Jailson Barros (Diretor Financeiro)'
  );

  -- Diretor de Operações  
  PERFORM create_or_update_director(
    'enio.gomes@ejgtransporte.com.br',
    'operacional123',
    'Ênio Gomes (Diretor de Operações)'
  );
END;
$$;