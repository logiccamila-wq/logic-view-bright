# Arquitetura Unificada (Azure-only)

## Stack oficial
- Frontend: React + TypeScript + Vite
- UI: TailwindCSS + shadcn/ui
- Runtime API: Azure Functions (`api/runtime/index.js`)
- Banco: Azure Database for PostgreSQL
- IA: Azure OpenAI
- Deploy: Azure Static Web Apps + GitHub Actions
- Domínio: `www.xyzlogicflow.com.br`

## Fluxo
```text
Browser -> Azure Static Web Apps -> /api/runtime/* -> PostgreSQL
                                    -> /api/runtime/invoke/* -> Azure Functions externas (opcional)
```

## Componentes-chave
- `src/integrations/supabase/client.ts`: camada de compatibilidade para manter chamadas existentes de frontend.
- `api/runtime/index.js`: endpoints auth/query/mutate/rpc/invoke.
- `api/shared/db.js`: conexão segura com PostgreSQL.
- `.github/workflows/azure-static-web-apps.yml`: pipeline de build/deploy.

## Segurança
- Secrets somente no backend Azure (nunca no frontend).
- JWT do runtime via `AZURE_JWT_SECRET`.
- CORS restrito com `ALLOWED_ORIGINS`.

## Observação
- Referências históricas a Vercel/Supabase/Cloudflare/Firebase devem ser tratadas como legado e não devem orientar novas implementações.
