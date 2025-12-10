INSERT INTO public.modules (key, name, description, category, enabled)
VALUES
  ('employees','Funcionários','Gestão de funcionários e RH','business', true),
  ('users','Usuários','Gestão de usuários e perfis','system', true),
  ('inventory','Estoque/Oficina','Gestão de estoque e oficina','maintenance', true),
  ('settings','Configurações','Configurações globais do sistema','system', true),
  ('hr','Recursos Humanos','Módulo de RH','business', true),
  ('dp','Departamento Pessoal','Módulo de DP','business', true)
ON CONFLICT (key) DO NOTHING;

