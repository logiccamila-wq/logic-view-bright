# Setup de Usuários - OptiLog

## Configuração Completa de Autenticação

O sistema de autenticação está completamente implementado com:
- ✅ Login/Logout integrado com Supabase
- ✅ Proteção de rotas por módulo
- ✅ Controle de permissões baseado em roles
- ✅ Auto-confirmação de email habilitada
- ✅ Edge function para seed automático de usuários

## Método Recomendado: Edge Function (Automático)

A forma mais rápida e fácil de popular todos os usuários é usar a edge function `seed-users`.

### Como Usar:

1. A edge function já foi criada e será automaticamente deployada
2. Após o deploy, você pode chamá-la de duas formas:

**Opção A: Via Navegador**
```
https://YOUR_SUPABASE_URL.supabase.co/functions/v1/seed-users
```

**Opção B: Via cURL**
```bash
curl -X POST https://YOUR_SUPABASE_URL.supabase.co/functions/v1/seed-users \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

**⚠️ IMPORTANTE:** Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual values from Supabase Dashboard → Settings → API.

A edge function irá:
- ✅ Criar todos os 21 usuários automaticamente
- ✅ Atribuir as roles corretas
- ✅ Confirmar os emails automaticamente
- ✅ Pular usuários que já existem
- ✅ Retornar um resumo detalhado do processo


## Método Alternativo: Script SQL Manual

Se preferir criar usuários manualmente, após os usuários se registrarem pela interface, use este script para atribuir as roles corretas.

**IMPORTANTE:** Substitua os `user_id` pelos IDs reais dos usuários após o registro.

```sql
-- Motoristas (role: 'driver')
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'driver'::app_role
FROM auth.users
WHERE email IN (
  'motorista.jailson@ejgtransporte.com.br',
  'motorista.rivanio@ejgtransporte.com.br',
  'motorista.enio@ejgtransporte.com.br',
  'motorista.ednaldo@ejgtransporte.com.br',
  'motorista.nilton@ejgtransporte.com.br',
  'motorista.marcio@ejgtransporte.com.br',
  'motorista.joseantonio@ejgtransporte.com.br',
  'motorista.ruan@ejgtransporte.com.br',
  'motorista.geisiel@ejgtransporte.com.br',
  'motorista.danilo@ejgtransporte.com.br',
  'motorista.messias@ejgtransporte.com.br'
);

-- Financeiro
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'finance'::app_role
FROM auth.users
WHERE email = 'jailson.barros@ejgtransporte.com.br';

-- Operações
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'operations'::app_role
FROM auth.users
WHERE email = 'enio.gomes@ejgtransportecom.br';

-- Gerente Geral (Admin)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'administrati@ejgtransporte.com.br';

-- Comercial
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'commercial'::app_role
FROM auth.users
WHERE email = 'comercial@ejgtransporte.com.br';

-- Frota/Manutenção
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'fleet_maintenance'::app_role
FROM auth.users
WHERE email = 'frota@ejgtransporte.com.br';

-- Auxiliar Manutenção
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'maintenance_assistant'::app_role
FROM auth.users
WHERE email = 'miguellareste37@gmail.com';

-- Admins
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
  'logiccamila@gmail.com',
  'camila.eteste@gmail.com',
  'camila.etseral@gmail.com',
  'teste@teste.com'
);
```

## Lista de Usuários e Credenciais

### Motoristas (Acesso: dashboard, frota, tms)
- Email: motorista.jailson@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.rivanio@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.enio@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.ednaldo@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.nilton@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.marcio@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.joseantonio@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.ruan@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.geisiel@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.danilo@ejgtransporte.com.br | Senha: motorista123
- Email: motorista.messias@ejgtransporte.com.br | Senha: motorista123

### Diretores e Gestores

**Financeiro** (Acesso: dashboard, erp, relatórios)
- Email: jailson.barros@ejgtransporte.com.br | Senha: financeiro123

**Operações** (Acesso: dashboard, operacoes, tms, frota)
- Email: enio.gomes@ejgtransportecom.br | Senha: operacional123

**Gerente Geral** (Acesso total)
- Email: administrati@ejgtransporte.com.br | Senha: adm123456

**Comercial** (Acesso: dashboard, tms, crm)
- Email: comercial@ejgtransporte.com.br | Senha: comercial123

**Frota/Manutenção** (Acesso: dashboard, frota, mechanic)
- Email: frota@ejgtransporte.com.br | Senha: frota123

**Auxiliar Manutenção** (Acesso: dashboard, mechanic)
- Email: miguellareste37@gmail.com | Senha: auxiliar123

### Admins (Acesso total)
- Email: logiccamila@gmail.com | Senha: Multi12345678
- Email: camila.eteste@gmail.com | Senha: Multi@#$%362748
- Email: camila.etseral@gmail.com | Senha: Multi@#$%362748
- Email: teste@teste.com | Senha: teste123

## Mapeamento de Permissões por Role

```typescript
const MODULE_PERMISSIONS = {
  driver: ['dashboard', 'fleet', 'tms'],
  finance: ['dashboard', 'erp', 'reports'],
  operations: ['dashboard', 'operations', 'tms', 'fleet'],
  admin: ['dashboard', 'wms', 'tms', 'oms', 'scm', 'crm', 'erp', 'fleet', 'mechanic', 'driver', 'reports', 'settings', 'users'],
  commercial: ['dashboard', 'tms', 'crm'],
  fleet_maintenance: ['dashboard', 'fleet', 'mechanic'],
  maintenance_assistant: ['dashboard', 'mechanic'],
};
```

## Testando o Sistema

1. Faça logout se estiver logado
2. Acesse `/login`
3. Faça login com um dos usuários acima
4. Verifique que apenas os módulos permitidos aparecem no menu lateral
5. Tente acessar um módulo não permitido - você será redirecionado ao dashboard
6. Teste o logout - você será redirecionado para o login

## Estrutura de Segurança

- ✅ **Roles em tabela separada** (previne escalação de privilégios)
- ✅ **RLS policies** (proteção a nível de banco de dados)
- ✅ **Security definer functions** (evita recursão infinita em RLS)
- ✅ **Proteção de rotas no frontend** (UX + segurança)
- ✅ **Validação de permissões server-side** (via Supabase RLS)

## Próximos Passos

Após popular os usuários:
1. Testar login com diferentes roles
2. Verificar permissões de módulos
3. Configurar dados mockados específicos por role (opcional)
4. Implementar dashboard personalizado por role (opcional)
