# Arquitetura Unificada (Azure-only)

## Stack oficial
- Frontend: React + TypeScript + Vite
- UI: TailwindCSS + shadcn/ui
- Runtime API: Azure App Service (`server/index.js`) with shared runtime handlers in `api/runtime/index.js`
- Banco: Azure Database for PostgreSQL
- IA: Azure OpenAI
- Deploy: Azure Static Web Apps + Azure App Service + GitHub Actions
- Domínio: `www.xyzlogicflow.com.br` (ativo até 2027-02-23, renovação automática)
- DNS: Azure DNS (`ns1-07.azure-dns.com`, `ns2-07.azure-dns.net`, `ns3-07.azure-dns.org`, `ns4-07.azure-dns.info`)

## Fluxo
```text
Browser -> Azure Static Web Apps -> Azure App Service (`/api/*`) -> PostgreSQL
                                                     -> Azure Application Insights
```

## Componentes-chave
- `src/integrations/azure/client.ts`: cliente de runtime para o frontend.
- `api/runtime/index.js`: endpoints auth/query/mutate/rpc/invoke.
- `api/shared/db.js`: conexão segura com PostgreSQL.
- `.github/workflows/azure-deploy.yml`: pipeline de build e deploy.

## Segurança
- Secrets somente no backend Azure (nunca no frontend).
- JWT do runtime via `AZURE_JWT_SECRET`.
- CORS restrito com `ALLOWED_ORIGINS`.
