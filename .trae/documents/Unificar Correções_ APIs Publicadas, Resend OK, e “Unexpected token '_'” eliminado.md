## Diagnóstico
- O erro “Unexpected token '<'” ocorre quando o frontend chama `response.json()` e recebe HTML (fallback da SPA) por 404 nas rotas `/api/*`.
- Há dois cron endpoints distintos no projeto:
  - Vercel: `api/process-cron.ts` (Node serverless no seu domínio)
  - Supabase Edge: `supabase/functions/process-cron/index.ts` (Deno em `https://<PROJECT-REF>.functions.supabase.co/process-cron`)
- Em Vercel, funções de `api/` não apareceram nos deployments (404). Houve conflito `functions` × `builds` no `vercel.json` que já foi tratado removendo `functions`.

## Objetivos
- Publicar e validar `/api/send-email` e `/api/process-cron` em Vercel.
- Configurar `RESEND_API_KEY` corretamente (formato `re_...`) e DNS do Resend (DKIM/SPF) sem quebrar Zoho.
- Endurecer frontend para não quebrar quando a resposta não for JSON.
- Organizar domínios (`xyzlogicflow.tech` e `www.xyzlogicflow.tech`) e redirecionamento primário.

## Implementação (Vercel)
1. Garantir código e configuração no repositório usado pelo projeto no Vercel:
   - Confirmar presença de `api/send-email.ts` e `api/process-cron.ts`.
   - `vercel.json` com:
     - Builds: `{ "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist", "buildCommand": "npm run build" } }` e `{ "src": "api/**/*.ts", "use": "@vercel/node" }`
     - Rotas: `"/api/(.*)" → "/api/$1"` e `"/(.*)" → "/index.html"`
     - Cron diário: `0 0 * * *` para `"/api/process-cron"`
2. Adicionar `RESEND_API_KEY` (valor `re_...`) nas variáveis do Vercel (Prod/Preview/Dev) e manter `ALLOWED_ORIGINS`.
3. Adicionar o apex `xyzlogicflow.tech` no projeto (além do `www`) e definir o primário; o alternativo redireciona 301.
4. Redeploy pelo painel (usando o commit com `api/*` e `vercel.json`).

## Implementação (Supabase Edge)
- Usar a URL de funções do Supabase para chamar o cron Edge: `https://<PROJECT-REF>.functions.supabase.co/process-cron`.
- Garantir CORS com `ALLOWED_ORIGINS` e segredos (`SUPABASE_SERVICE_ROLE_KEY`) corretos.

## Frontend (Endurecimento)
- Introduzir utilitário de leitura segura:
```
async function safeJson(r) {
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  if (!ct.includes('application/json')) throw new Error('Resposta não JSON')
  return r.json()
}
```
- Usar `safeJson` nas chamadas a `/api/send-email` e tratar `ERR_ABORTED` como erro de navegação/rede.

## DNS – Resend
- DKIM: `TXT resend._domainkey` com `p=...` (já adicionado; verificar no painel do Resend).
- SPF:
  - Apex com Zoho: `TXT @ → "v=spf1 include:zohomail.com include:amazonses.com ~all"`, ou
  - Subdomínio dedicado: `TXT send → "v=spf1 include:amazonses.com ~all"` e `MX send → feedback-smtp.sa-east-1.amazonses.com`; usar `from: noreply@send.xyzlogicflow.tech`.
- Não alterar `MX @` se o recebimento continuar no Zoho.

## Validações
- SPA: `https://www.xyzlogicflow.tech` → 200; `https://xyzlogicflow.tech` → 200 ou 301 para o primário.
- API presente: `GET https://www.xyzlogicflow.tech/api/send-email` → 405.
- Envio real: `POST /api/send-email` com corpo de teste → 200 e JSON com `id`; se 401, revisar `RESEND_API_KEY`; se 500, aplicar env no deploy.
- Supabase Edge: `GET https://<PROJECT-REF>.functions.supabase.co/process-cron` → JSON esperado.
- Observabilidade: checar “Functions” e “Runtime Logs” no deployment.

## Entregáveis
- `/api/send-email` e `/api/process-cron` publicados e testados.
- SPA servida no domínio primário com redirecionamento do alternativo.
- E-mail via Resend validado com retorno de `id`.
- Frontend robusto contra resposta não-JSON.

Confirma para eu executar os commits/ajustes, redeploy e validações imediatamente?