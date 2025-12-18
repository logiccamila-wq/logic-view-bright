## Objetivos

* Publicar versão atual com login funcional e UI/UX modernizada

* Estabilizar deploy (Vercel) e domínio `www.xyzlogicflow.tech`

* Garantir funcionamento de Auth, rotas, PWA, e observabilidade

* Preparar terreno para recursos avançados (overlay de custos, OTIF, app motorista e hub mecânico)

## Recuperação de Deploy

1. Promover último deployment “Ready” para Production (sem novo upload) e anexar `www.xyzlogicflow.tech` ao deployment ativo
2. Verificar Build & Output no Vercel: Build `npm run build`, Output `dist`, Node 20.x
3. Corrigir envs Production (sem crases):

   * Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

   * Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`, `TPMS_INGEST_KEY`
4. Desbloqueio de rate limit: aguardar janela (\~11–12h) ou migrar para plano Pro; reduzir tentativas e consolidar uploads
5. Limpar PWA: usar botão “Atualizar App” (unregister SW + clear caches) e hard reload

## Correção de Auth e Rotas

1. Validar que `<AuthProvider>` envolve o `BrowserRouter/Routes` na árvore principal
2. Confirmar que “Login” não é renderizado por um caminho alternativo sem provider (preview/entrada paralela)
3. Manter Error Boundary global; remover erros de `useAuth` e testar `/login`

## UI/UX Login (Padrão Startup)

1. Ativar visual modernizado (gradiente, glass-card, contraste, botões personalizados)
2. Ajustar marca via query `brand` sem comprometer legibilidade
3. Verificar acessibilidade (labels, foco, contraste) e animações discretas

## Domínio e SPA Fallback

1. Confirmar fallback SPA no Vercel (`vercel.json` com `routes` → `index.html`)
2. Manter `_redirects` apenas se usar Netlify; para Vercel, a regra já está aplicada

## Observabilidade & Segurança

1. Conferir invocações do cron (`/api/process-cron`) após 1h; revisar `function_logs` e `audit_trail`
2. Garantir `x-correlation-id` nas respostas e logs
3. Revisar CORS com `ALLOWED_ORIGINS` aplicado

## Validação Funcional

1. Smoke test em produção: `/login`, `/executive-dashboard`, `/fleet` (Pneus/Produtividade), `/ehs`, `/logistics-kpi`
2. Testar ingestão IoT TPMS (POST com `x-tpms-key`) e cron manual
3. Limpeza PWA e navegação sem assets antigos

## Próximos Incrementos (após go live)

1. Overlay de custos no Rastreador ao Vivo (combustível, pedágios, var/km, CPK)
2. Cartões OTIF e ciclo de pedido em `LogisticsKPI`
3. App Motorista: lista de viagens e macros por viagem (engate/desengate, retorno vazio) e KM por sessão
4. Hub do Mecânico: ponto de turno, produtividade por O.S., consumo de estoque

## Entregáveis

* Site atualizado, login funcional e UI/UX padronizada

* Deploy estável com domínio correto e PWA limpo

* Relatório de validação (rotas, funções, logs) e próximos passos aprovados

