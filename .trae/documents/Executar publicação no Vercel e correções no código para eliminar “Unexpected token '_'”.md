## Objetivo
- Publicar as APIs no Vercel (`/api/send-email`, `/api/process-cron`), ajustar ambientes (Resend/DOMÍNIO), e blindar o frontend para remover “Unexpected token '<'”.

## Alterações no Código
- Criar utilitário de leitura segura de JSON e substituir `response.json()`:
  - Arquivo novo `src/utils/http.ts` com `safeJson(r)`:
    - Valida `r.ok` e `Content-Type` conter `application/json` antes de `r.json()`.
  - Aplicar `safeJson` nas chamadas `fetch` localizadas em:
    - `src/components/driver/TripAlerts.tsx`, `src/components/GaelChatbot.tsx`
    - `src/pages/EHS.tsx`, `src/pages/Insurance.tsx`, `src/pages/Developer.tsx`, `src/pages/CostMonitoring.tsx`, `src/pages/CRM.tsx`
- Garantir APIs em Vercel:
  - `api/send-email.ts` já criado: retorna JSON do Resend e status `200`/erro.
  - `api/process-cron.ts` sem tipos de `@vercel/node` para compilar com Node runtime padrão.

## Configuração Vercel
- `vercel.json` (sem `functions`):
  - Builds:
    - `{ "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist", "buildCommand": "npm run build" } }`
    - `{ "src": "api/**/*.ts", "use": "@vercel/node" }`
  - Rotas:
    - `"/api/(.*)" → "/api/$1"`
    - `"/(.*)" → "/index.html"`
  - Cron diário: `0 0 * * *` em `"/api/process-cron"`
- Variáveis de ambiente:
  - `RESEND_API_KEY` (chave do Resend `re_...`) em Production/Preview/Development.
  - `ALLOWED_ORIGINS= https://xyzlogicflow.tech,https://www.xyzlogicflow.tech,https://logic-view-bright.vercel.app`
- Domínios:
  - Adicionar `xyzlogicflow.tech` ao projeto (além de `www`) e definir o primário; o alternativo redireciona 301.

## Supabase Edge
- Usar a URL correta para cron Edge: `https://<PROJECT-REF>.functions.supabase.co/process-cron`.
- Garantir CORS via `ALLOWED_ORIGINS` e segredos `SUPABASE_SERVICE_ROLE_KEY`.

## Resend DNS (envio)
- DKIM: `TXT resend._domainkey` com `p=...` (verificar no painel após propagação).
- SPF:
  - Apex com Zoho: `TXT @ → "v=spf1 include:zohomail.com include:amazonses.com ~all"`; ou
  - Subdomínio `send`: `TXT send → "v=spf1 include:amazonses.com ~all"` e `MX send → feedback-smtp.sa-east-1.amazonses.com`; usar `from: noreply@send.xyzlogicflow.tech`.
- Não alterar `MX @` se o recebimento é pelo Zoho.

## Publicação e Rate Limit
- Aguardar 3–5 minutos se aparecer `rate_limited`.
- Fazer um único redeploy de Produção com as alterações acima.

## Validações
- SPA: `https://www.xyzlogicflow.tech` → 200; `https://xyzlogicflow.tech` → 200 ou 301.
- API presente: `GET https://www.xyzlogicflow.tech/api/send-email` → 405.
- Envio real: `POST /api/send-email` → 200 e JSON (`id`).
- Supabase Edge: `GET https://<PROJECT-REF>.functions.supabase.co/process-cron` → JSON.

## Entregáveis
- APIs publicadas e testadas, erro “Unexpected token '<'” eliminado.
- Envio de e-mail via Resend validado (id retornado).
- Frontend robusto contra resposta não‑JSON.

Posso aplicar agora as alterações de código, ajustar o Vercel e executar o redeploy/validações?