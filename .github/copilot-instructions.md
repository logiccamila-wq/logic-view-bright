# Copilot Instructions for logic-view-bright

## Visão Geral da Arquitetura
- **Frontend:** React 18 + TailwindCSS + Vite (ver `src/` e `vite.config.ts`).
- **Backend:** Edge Functions (Cloudflare/Supabase) em `functions/` e `supabase/functions/`.
- **Banco de Dados:** Supabase (PostgreSQL), com scripts de seed em `scripts/` e migrações em `supabase/migrations/`.
- **Integrações:** EmailJS, WhatsApp Business API, OpenRouteService, TomTom, OCR, Webhooks TMS (ver `src/pages/EIP.tsx`).
- **Principais domínios:** Gestão de frota, motoristas, viagens, documentos, manutenção, finanças, permissões.

## Fluxos e Convenções
- **Módulos e Rotas:** Listados em `src/modules/registry.ts` (ex: `/drivers-management`, `/approvals`, `/logistics-kpi`).
- **Edge Functions:** Use variáveis de ambiente para chaves (ex: `SUPABASE_SERVICE_ROLE_KEY`). Nunca exponha segredos no frontend.
- **Permissões:** Controle por roles, ver lógica em `api/ai-analyze.ts` e `functions/api/permissions-matrix.ts`.
- **Documentos e KPIs:** Tipos e lógica em `src/pages/Documents.tsx` e `src/utils/importDocuments.ts`.
- **Ações de Processos:** Padrão de insert/update via Supabase, ver `src/components/fleet/ProcessActions.tsx`.
- **Macros de Viagem:** Padrão em `src/pages/DriverMacros.tsx` e seed em `scripts/seed-demo.cjs`.

## Workflows de Desenvolvimento
- **Build:** `vite` (ver `vite.config.ts`).
- **Seed de dados:** Use scripts em `scripts/` (ex: `seed-demo.cjs`, `seed-roles.cjs`).
- **Deploy:** Vercel SPA (`vercel.json`), funções Edge via Supabase CLI.
- **Testes:** Não há framework de testes automatizados detectado; scripts de seed simulam cenários.
- **Debug:** Logs em funções Edge e scripts, use `console.log`.

## Padrões Específicos
- **Importação de documentos:** Use interfaces e helpers de `src/utils/importDocuments.ts`.
- **Conexão Supabase:** Sempre via helpers em `@/integrations/supabase/client`.
- **Componentização:** Componentes em `src/components/`, use composição e hooks de contexto.
- **Internacionalização:** Locales em `public/locales/`.
- **Env Vars:** Centralize e valide presença de tokens (ver `.trae/documents/Auditar e Corrigir Backend e Frontend.md`).

## Exemplos de Integração
- **Edge Function:** `functions/api/db.ts` mostra padrão de autorização e acesso a tabelas permitidas.
- **Seed Demo:** `functions/api/seed-demo.ts` e `scripts/seed-demo.cjs` exemplificam criação de dados de exemplo.
- **Documentos:** `src/pages/Documents.tsx` e `src/utils/importDocuments.ts` para lógica de documentos e KPIs.

## Segurança
- **Nunca exponha chaves sensíveis no frontend.**
- **Regras de acesso e RLS:** Veja exemplos em `supabase/migrations/` e `.trae/documents/Auditar e Corrigir Backend e Frontend.md`.

---

> Revise e atualize este arquivo conforme padrões evoluírem. Consulte sempre os arquivos de seed, funções Edge e `src/modules/registry.ts` para entender fluxos principais.
