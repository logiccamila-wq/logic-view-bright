-- Diagnostic: Verificar roles do usuário logiccamila@gmail.com
DO $$
DECLARE
  user_record RECORD;
  role_count INT;
BEGIN
  -- Buscar usuário
  SELECT id, email, email_confirmed_at
  INTO user_record
  FROM auth.users
  WHERE email = 'logiccamila@gmail.com';

  IF user_record.id IS NULL THEN
    RAISE NOTICE 'ERRO: Usuário logiccamila@gmail.com não encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'Usuário encontrado: ID=%, Email=%', user_record.id, user_record.email;

  -- Verificar roles
  SELECT COUNT(*) INTO role_count
  FROM user_roles
  WHERE user_id = user_record.id;

  RAISE NOTICE 'Total de roles: %', role_count;

  -- Mostrar roles existentes
  FOR role_record IN 
    SELECT role FROM user_roles WHERE user_id = user_record.id
  LOOP
    RAISE NOTICE 'Role existente: %', role_record.role;
  END LOOP;

  -- Se não tiver role admin, adicionar
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_record.id AND role = 'admin'
  ) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (user_record.id, 'admin');
    RAISE NOTICE 'Role ADMIN adicionada!';
  ELSE
    RAISE NOTICE 'Role ADMIN já existe';
  END IF;
END $$;

-- Verificar resultado final
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'logiccamila@gmail.com';
