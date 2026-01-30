## Passo final para ver os módulos após login

Se o menu continua vazio mesmo depois do deploy, faltou conceder a role `admin` no Supabase para o seu usuário.

1. Acesse o editor SQL do seu projeto Supabase  
   `https://supabase.com/dashboard/project/<SEU_PROJECT_ID>/sql/new`
2. Execute o SQL abaixo (ajuste o e-mail para o admin desejado):
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'seu-email-admin@dominio.com'
   ON CONFLICT (user_id, role) DO NOTHING;
   ```
3. Faça logout e login no site (Cloudflare: `seu-app.workers.dev` ou URL do seu deployment).

Isso não é automatizado em migração por segurança; é uma concessão manual única.
