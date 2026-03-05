## Escopo e Objetivos

* Revisar e corrigir todo o backend (Supabase Edge Functions, políticas de segurança, variáveis de ambiente e integrações).

* Revisar e corrigir todo o frontend (React + Vite, roteamento, autenticação, performance, PWA, UI/UX) com foco em confiabilidade, segurança e tempo de carregamento.

* Padronizar observabilidade, tratamento de erros e testes.

## Diagnóstico Rápido

* Frontend SPA com Vite/React, React Router, React Query, shadcn/Radix, Tailwind, PWA; muitas páginas e libs pesadas (mapas, PDF, MUI).

* Backend via Supabase com múltiplas Edge Functions (CT-e/MDFe, importações, alertas, geocodificação, rotas) usando diversos tokens externos.

* Autorização de módulos feita no cliente; falta enforcement robusto no backend/Row Level Security.

* Inconsistência de chaves em functions (algumas `anon`, outras `service_role`); segredo de certificado dentro do repo (`supabase/functions/_shared/certificado.pfx`).

## Correções Backend

* Padronizar cliente Supabase nas Edge Functions para operações de escrita:

  * Migrar para `SUPABASE_SERVICE_ROLE_KEY` onde houver insert/update e garantir verificação de usuário.

  * Ex.: trocar chave em `supabase/functions/ejg-chatbot/index.ts:25-28` para service role e validar que o usuário pertence à conversa antes de gravar em `chat_messages`.

* CORS mais restritivo:

  * Substituir `Access-Control-Allow-Origin: *` por lista de origens permitidas via env (`ALLOWED_ORIGINS`), mantendo preflight.

* Validação de entrada e limites:

  * Padronizar uso de `zod` em todas as functions (já presente em `ejg-chatbot`) com schemas e mensagens consistentes.

  * Limitar tamanhos de payload e listas (mensagens, lotes de importação).

* Gestão de segredos e certificados:

  * Remover artefatos sensíveis do repo (`supabase/functions/_shared/certificado.pfx`). Carregar via env (`CERT_PFX_BASE64`) e decodificar em runtime.

* Resiliência e observabilidade:

  * Respostas padronizadas `{ success, data|error }` e logs estruturados (correlation id por requisição).

  * Tratamento específico para 429/402/5xx em integrações (ex.: gateway AI, Brasil NFe) com backoff simples.

* RLS/Autorização:

  * Garantir políticas em tabelas críticas (`chat_messages`, `cte`, `mdfe`, `driver_payroll`, etc.) para que somente donos/admins operem.

## Correções Frontend

* Divisão de código e lazy loading:

  * Converter páginas em `src/App.tsx:63-116` para `React.lazy` + `Suspense` e reduzir bundle inicial.

* Erros e UX de proteção:

  * Adicionar Error Boundary global e por rota; melhorar feedback em `ProtectedRoute.tsx:28-34` com mensagem e log.

* Dependências e peso:

  * Remover `next` se não usado; manter `next-themes` (já em `src/components/ui/sonner.tsx:1`).

  * Avaliar MUI usage real; onde possível, usar componentes shadcn já existentes.

* PWA e caching:

  * Ajustar `vite.config.ts:31-97` para escopos de cache mais seguros (excluir imagens grandes, logs), e desativar logs do Workbox em produção.

* Supabase client e envs:

  * Confirmar sanitização em `src/integrations/supabase/client.ts:21-26` e tratar ausência de env com fallback de UX.

* Acessibilidade e consistência:

  * Auditar componentes `ui/*` para roles/aria/contraste; padronizar ícones e tokens de tema.

## Testes e Qualidade

* Unit tests com `vitest` + `@testing-library/react`:

  * Cobrir `AuthContext` (fluxo de login, roles), `ProtectedRoute`, componentes financeiros (ex.: `components/bank/*`).

* E2E com `Playwright`:

  * Fluxo de login, navegação protegida, emissão de CT-e (mock da função), upload/importações.

* Lint/TS:

  * Endurecer regras (ativar `@typescript-eslint/no-unused-vars`), e `tsconfig` com `strict: true`.

* CI:

  * Pipeline para lint, build e testes; publicar preview.

## Segurança e Políticas

* Revisão de RLS e criação/ajuste de políticas em `supabase/migrations/*`:

  * `profiles`, `user_roles`, `chat_*`, `cte`, `mdfe`, `driver_*`, `inventory_*`, `financial_*` com ownership e escopos por role.

* Tokens externos:

  * Centralizar variáveis (`BRASILNFE_API_TOKEN`, `LOVABLE_API_KEY`, etc.) e validar presença; nunca expor em frontend.

## Deploy/CI/CD

* Vercel SPA (`vercel.json:7-9`) ok; adicionar envs no painel e secrets out-of-repo (service role somente nas Edge Functions).

* Automatizar deploy das Supabase Functions com `supabase CLI` e gates de testes.

## Entregáveis

* PR com correções de backend (keys, CORS, validação, segredos) e frontend (lazy loading, Error Boundary, PWA otimizada).

* Testes unitários e E2E básicos cobrindo rotas e flows críticos.

* Documentação breve de envs e políticas RLS atualizadas.

## Confirmação

* Posso executar o plano acima agora e entregar as correções com testes?

