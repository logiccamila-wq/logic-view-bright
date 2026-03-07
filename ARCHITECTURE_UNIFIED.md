# Arquitetura Unificada (Azure-only)

## Stack oficial
- Frontend: React + TypeScript + Vite
- UI: TailwindCSS + shadcn/ui
- Runtime API: Azure Functions (`api/runtime/index.js`)
- Banco: Azure Database for PostgreSQL
- IA: Azure OpenAI
- Deploy: Azure Static Web Apps + GitHub Actions
- Domínio: `www.xyzlogicflow.com.br` (ativo até 2027-02-23, renovação automática)
- DNS: Azure DNS (`ns1-07.azure-dns.com`, `ns2-07.azure-dns.net`, `ns3-07.azure-dns.org`, `ns4-07.azure-dns.info`)

## Fluxo
```text
Browser -> Azure Static Web Apps -> /api/runtime/* -> PostgreSQL
                                    -> /api/runtime/invoke/* -> Azure Functions externas (opcional)
```

## Componentes-chave
- `src/integrations/azure/client.ts`: cliente Azure runtime que expõe API de query/auth compatível.
- `api/runtime/index.js`: endpoints auth/query/mutate/rpc/invoke.
- `api/shared/db.js`: conexão segura com PostgreSQL.
- `.github/workflows/azure-static-web-apps.yml`: pipeline de build/deploy.

## Segurança
- Secrets somente no backend Azure (nunca no frontend).
- JWT do runtime via `AZURE_JWT_SECRET`.
- CORS restrito com `ALLOWED_ORIGINS`.
