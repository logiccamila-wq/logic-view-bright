# Copilot Instructions for logic-view-bright

## Arquitetura e Estrutura

**Stack Principal (100% Azure):**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Azure Functions (Node) + Azure Database for PostgreSQL
- Deploy: Azure Static Web Apps (frontend + managed functions)
- Domínio: www.xyzlogicflow.com.br

**Sistema de Módulos:**
- Todos módulos definidos em [src/modules/registry.ts](../src/modules/registry.ts)
- Categorias: `operations`, `finance`, `maintenance`, `iot`, `business`, `dev`
- Rotas lazy-loaded via React Router v7 em [src/App.tsx](../src/App.tsx)
- Exemplos: `/drivers-management`, `/approvals`, `/logistics-kpi`, `/supergestor`

**Permissões e Auth:**
- Sistema baseado em roles via [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)
- Roles principais: `admin`, `driver`, `finance`, `operations`, `fleet_maintenance`
- ROLE_ALIASES normaliza roles em português (motorista → driver, mecanico → fleet_maintenance)
- Controle de acesso por módulo em `MODULE_PERMISSIONS` (AuthContext)
- Azure Functions validam roles via `user_roles` table

## Padrões de Código

**Imports e Paths:**
- Use alias `@/` para imports (tsconfig.json baseUrl: `./`, paths: `@/*` → `./src/*`)
- Exemplos: `@/components/ui/button`, `@/integrations/azure/client`, `@/hooks/useDrivers`

**Runtime Client (camada de compatibilidade Azure):**
- **SEMPRE** importe via `import { runtimeClient } from "@/integrations/azure/client"`
- O arquivo `src/integrations/azure/client.ts` é na verdade um **client Azure runtime**
- Usa API Azure (`VITE_API_BASE_URL` + endpoints `/api/runtime/*`)
- 
**Data Fetching:**
- Use TanStack Query (React Query) para cache e sincronização
- Padrão em custom hooks: `useDrivers`, `useEmployees`, `usePayroll`, `useFinancialData`
- Queries: `useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers })`
- Mutations: `useMutation({ mutationFn: createDriver, onSuccess: () => queryClient.invalidateQueries(['drivers']) })`

**UI Components:**
- shadcn/ui em [src/components/ui/](../src/components/ui/)
- Componentes: `Button`, `Card`, `Dialog`, `Table`, `Select`, `Badge`, etc.
- Layout: `<Layout>` wrapper com `<Header>` + `<Sidebar>` + alerts hooks
- Lazy loading de páginas com `<Suspense fallback={<SkeletonPage />}>`

**Contexts e Hooks:**
- `AuthContext`: auth, roles, permissions (ver [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx))
- `NotificationsContext`: alertas de sistema
- Hooks de negócio em [src/hooks/](../src/hooks/): `useDrivers`, `useMaintenanceAlerts`, `useCostAlerts`, `useTomTom`, etc.

## Runtime API (Backend Azure)

**Localização:** [api/runtime/index.js](../api/runtime/index.js)

**Padrão de Autorização:**
```typescript
// 1. Validar Bearer token (JWT assinado com AZURE_JWT_SECRET)
const authHeader = req.headers?.authorization || "";
const accessToken = authHeader.replace(/^Bearer\s+/i, "");

// 2. Validar JWT e extrair user_id
// 3. Buscar roles via user_roles table (query PostgreSQL direto)

// 4. Validar permissão
const allowedRoles = ["admin", "finance", "logistics_manager"];
const isAllowed = roles.some(r => allowedRoles.includes(r));
```

**CORS Padrão:**
- `ALLOWED_ORIGINS` env var (CSV) define origens permitidas
- Preflight handler para OPTIONS requests

**Env Vars (Azure):**
- `DATABASE_URL` — conexão PostgreSQL
- `AZURE_JWT_SECRET`, `AZURE_JWT_EXPIRES_IN` — autenticação JWT
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` — IA
- `ALLOWED_ORIGINS` — CORS

**Deploy:**
```bash
# Frontend + API via workflow GitHub Actions + Azure
git push origin main
```

## Workflows de Desenvolvimento

**Dev Local:**
```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # vite build → dist/
```

**Seed de Dados:**
- Scripts em [scripts/](../scripts/): `seed-demo.cjs`, `seed-via-api.cjs`
- Exemplo: `node scripts/seed-demo.cjs` (usa API `/api/db`)

## Integrações Externas

**APIs e Serviços:**
- EmailJS: envio de emails
- WhatsApp Business API: alertas
- OpenRouteService: rotas/geocoding
- TomTom: mapas/geocoding
- Azure OpenAI: análise IA

## Domínios de Negócio

**Gestão de Frota:** veículos, manutenção, documentação
**Motoristas:** cadastro, jornada, macros de viagem, payroll
**Logística (TMS):** viagens, CTe, MDFe, rastreamento GPS
**Financeiro:** abastecimentos, KPIs, conciliação bancária, aprovações

## Segurança

**Nunca exponha no frontend:**
- `AZURE_JWT_SECRET`, `DATABASE_URL`
- `AZURE_OPENAI_API_KEY`
- Qualquer secret/token de APIs externas

**Boas Práticas:**
- Validar env vars ao iniciar functions
- Sanitizar inputs antes de queries
- Rate limiting em endpoints sensíveis
- CORS restrito via ALLOWED_ORIGINS

**Deployment:**
- Frontend/API: Azure Static Web Apps + Azure App Service via GitHub Actions
- Env vars: Azure Static Web Apps Configuration / Azure App Service
- Domínio: www.xyzlogicflow.com.br (ativo até 2027-02-23, renovação automática)
- DNS: Azure DNS (ns1-07.azure-dns.com, ns2-07.azure-dns.net, ns3-07.azure-dns.org, ns4-07.azure-dns.info)

---

**Referências Rápidas:**
- Módulos: [src/modules/registry.ts](../src/modules/registry.ts)
- Auth: [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)
- Runtime client: [src/integrations/azure/client.ts](../src/integrations/azure/client.ts)
- Azure Functions: [api/runtime/index.js](../api/runtime/index.js)
- SQL migrations: [sql/migrations/](../sql/migrations/)
- README: [README_FINAL.md](../README_FINAL.md)
