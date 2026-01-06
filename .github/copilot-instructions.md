# Copilot Instructions for logic-view-bright

## Arquitetura e Estrutura

**Stack Principal:**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- Backend: Supabase Edge Functions (Deno) + PostgreSQL
- Deploy: Vercel (frontend) + Supabase (backend/db)
- Domínio: xyzlogicflow.tech

**Sistema de Módulos:**
- Todos módulos definidos em [src/modules/registry.ts](src/modules/registry.ts)
- Categorias: `operations`, `finance`, `maintenance`, `iot`, `business`, `dev`
- Rotas lazy-loaded via React Router v7 em [src/App.tsx](src/App.tsx)
- Exemplos: `/drivers-management`, `/approvals`, `/logistics-kpi`, `/supergestor`

**Permissões e Auth:**
- Sistema baseado em roles via [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- Roles principais: `admin`, `driver`, `finance`, `operations`, `fleet_maintenance`
- ROLE_ALIASES normaliza roles em português (motorista → driver, mecanico → fleet_maintenance)
- Controle de acesso por módulo em `MODULE_PERMISSIONS` (AuthContext)
- Edge Functions validam roles via `user_roles` table (ver [supabase/functions/ai-analyze/index.ts](supabase/functions/ai-analyze/index.ts) L26-35)

## Padrões de Código

**Imports e Paths:**
- Use alias `@/` para imports (tsconfig.json baseUrl: `./`, paths: `@/*` → `./src/*`)
- Exemplos: `@/components/ui/button`, `@/integrations/supabase/client`, `@/hooks/useDrivers`

**Supabase Client:**
- **SEMPRE** importe via `import { supabase } from "@/integrations/supabase/client"`
- Client auto-configurado com env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Fallback mock se vars não definidas (ver [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) L36-62)
- Sanitização automática de env vars (remove backticks, quotes, espaços, placeholders)

**Data Fetching:**
- Use TanStack Query (React Query) para cache e sincronização
- Padrão em custom hooks: `useDrivers`, `useEmployees`, `usePayroll`, `useFinancialData`
- Queries: `useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers })`
- Mutations: `useMutation({ mutationFn: createDriver, onSuccess: () => queryClient.invalidateQueries(['drivers']) })`

**UI Components:**
- shadcn/ui em [src/components/ui/](src/components/ui/)
- Componentes: `Button`, `Card`, `Dialog`, `Table`, `Select`, `Badge`, etc.
- Layout: `<Layout>` wrapper com `<Header>` + `<Sidebar>` + alerts hooks
- Lazy loading de páginas com `<Suspense fallback={<SkeletonPage />}>`

**Contexts e Hooks:**
- `AuthContext`: auth, roles, permissions (ver [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx))
- `NotificationsContext`: alertas de sistema
- Hooks de negócio em [src/hooks/](src/hooks/): `useDrivers`, `useMaintenanceAlerts`, `useCostAlerts`, `useTomTom`, etc.

## Edge Functions (Backend)

**Localização:** [supabase/functions/](supabase/functions/)

**Padrão de Autorização:**
```typescript
// 1. Validar Bearer token
const authHeader = req.headers?.authorization || "";
const accessToken = authHeader.replace(/^Bearer\s+/i, "");

// 2. Buscar user via /auth/v1/user
const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
  headers: { Authorization: `Bearer ${accessToken}`, apikey: serviceKey }
});

// 3. Buscar roles via user_roles table
const rolesResp = await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${uid}&select=role`, {
  headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
});

// 4. Validar permissão
const allowedRoles = ["admin", "finance", "logistics_manager"];
const isAllowed = roles.some(r => allowedRoles.includes(r));
```

**CORS Padrão:**
- Helper em [supabase/functions/_shared/cors.ts](supabase/functions/_shared/cors.ts)
- `getAllowedOrigins()` lê `ALLOWED_ORIGINS` env (CSV)
- `buildCorsHeaders(origin)` retorna headers corretos
- `handlePreflight(origin)` para OPTIONS requests

**Env Vars Comuns:**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (sempre necessários)
- `AI_PROVIDER_KEY`, `AI_PROVIDER_MODEL`, `AI_PROVIDER_ENDPOINT` (para IA)
- `ALLOWED_ORIGINS` (CORS)
- Configurar via Supabase Dashboard → Settings → Edge Functions

**Deploy:**
```bash
npm run deploy:functions  # ou supabase functions deploy --no-verify-jwt
```

## Workflows de Desenvolvimento

**Dev Local:**
```bash
npm run dev       # Vite dev server (localhost:5173)
npm run check     # TypeScript check (--noEmit)
npm run lint      # ESLint (src/components/layout, src/modules)
```

**Build e Deploy:**
```bash
npm run build         # tsc + vite build → dist/
./deploy.sh           # Deploy completo (auto)
npm run deploy:all    # Build + git push + deploy functions
```

**Database:**
```bash
npm run db:push   # supabase db push (aplica migrations)
npm run db:reset  # supabase db reset (reset + seed)
```

**Seed de Dados:**
- Scripts em [scripts/](scripts/): `seed-demo.cjs`, `seed-roles.cjs`, `create-test-users.cjs`
- Exemplo: `node scripts/seed-demo.cjs` (usa API `/api/db`)
- Dados de exemplo: veículos (EJG-1234), trips, macros, refuelings, service_orders

**Validação e Testes:**
- Scripts de validação: `validate-system.cjs`, `health-check.cjs`, `verify-setup.cjs`
- Testes de login: `test-logins.cjs`, `test-camila-login.cjs`
- Não há framework de testes automatizados (sem Jest/Vitest)

## Integrações Externas

**APIs e Serviços:**
- EmailJS: envio de emails (ver hooks)
- WhatsApp Business API: alertas (send-whatsapp-alert function)
- OpenRouteService: rotas/geocoding (useOpenRouteService hook)
- TomTom: mapas/geocoding (useTomTom hook)
- OCR: processamento de documentos
- N8n: workflows via trigger-n8n-workflow function

**Exemplos de Functions:**
- `ai-analyze`: análise IA com rate limiting e roles
- `calculate-route`: cálculo de rotas (OpenRouteService/TomTom)
- `import-cte-xml`: importação CTe via XML
- `send-email`: envio via EmailJS
- `geocode-address`: geocoding de endereços

## Domínios de Negócio

**Gestão de Frota:**
- Veículos: `vehicles` table, status tracking, mileage
- Manutenção: `service_orders`, alertas preditivas ([src/pages/PredictiveMaintenance.tsx](src/pages/PredictiveMaintenance.tsx))
- Documentação: CRLV, licenças, vencimentos

**Motoristas:**
- Cadastro: `drivers` table via useDrivers hook
- Jornada: `driver_journey`, violações, macros
- Macros de viagem: INICIO, FIM, PAUSA (trip_macros table, [src/pages/DriverMacros.tsx](src/pages/DriverMacros.tsx))
- Payroll: cálculo via `calculate-driver-payroll` function

**Logística (TMS):**
- Viagens: `trips` table (origin, destination, status)
- CTe: importação XML, consulta status, emissão (functions/emitir-cte, import-cte-*)
- MDFe: emissão/encerramento (functions/emitir-mdfe, encerrar-mdfe)
- Rastreamento: GPS, IoT, telemetria ([src/pages/LiveTracking.tsx](src/pages/LiveTracking.tsx))

**Financeiro:**
- Abastecimentos: `refuelings` table
- KPIs: custo/km, despesas ([src/pages/LogisticsKPI.tsx](src/pages/LogisticsKPI.tsx))
- Conciliação bancária: `bank_reconciliation` table, import-bank-statement function
- Aprovações: workflow em [src/pages/Approvals.tsx](src/pages/Approvals.tsx)

## Segurança

**Nunca exponha no frontend:**
- `SUPABASE_SERVICE_ROLE_KEY` (só em Edge Functions)
- `AI_PROVIDER_KEY`, `OPENAI_API_KEY`
- Qualquer secret/token de APIs externas

**Boas Práticas:**
- Validar env vars ao iniciar functions (ver ai-analyze L14-16)
- Usar RLS policies em Supabase (migrations)
- Sanitizar inputs antes de queries
- Rate limiting em endpoints sensíveis (ai-analyze L47-51)
- CORS restrito via ALLOWED_ORIGINS

**Deployment:**
- Frontend: Vercel auto-deploy via GitHub (vercel.json)
- Backend: Supabase CLI manual (`npm run deploy:functions`)
- Env vars: Vercel Dashboard (frontend) + Supabase Dashboard (functions)
- DNS: Configurado para xyzlogicflow.tech (ver [docs/deployment-guides/](docs/deployment-guides/))

---

**Referências Rápidas:**
- Módulos: [src/modules/registry.ts](src/modules/registry.ts)
- Auth: [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- Supabase client: [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts)
- Edge Functions: [supabase/functions/](supabase/functions/)
- Deploy guides: [docs/deployment-guides/](docs/deployment-guides/)
- README completo: [README_FINAL.md](README_FINAL.md)
