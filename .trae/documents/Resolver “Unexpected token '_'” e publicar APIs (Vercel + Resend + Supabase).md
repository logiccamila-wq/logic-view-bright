## Causa
- O erro ocorre quando o app chama `response.json()` e recebe HTML do fallback da SPA em 404, típico quando `/api/*` não existe no deploy.
- Há duas rotas de “cron” distintas: Vercel (`api/process-cron.ts`) e Supabase Edge (`supabase/functions/process-cron/index.ts:1`). Chamar a função do Supabase via domínio do Vercel também retorna HTML.

## Verificações
- Confirmar se o deployment atual contém `api/send-email.ts:1` e `api/process-cron.ts:4` e se o `vercel.json` inclui builds para `api/**/*.ts` e SPA.
- Validar variáveis no Vercel: `RESEND_API_KEY` deve ser `re_...`, `ALLOWED_ORIGINS` correto.
- Adicionar o domínio apex `xyzlogicflow.tech` ao projeto e escolher o primário.

## Implementação
1. Garantir código de funções e config no repositório conectado ao projeto Vercel:
   - Adicionar/confirmar `api/send-email.ts` e `api/process-cron.ts`.
   - `vercel.json` com:
     - Builds: `{ "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist", "buildCommand": "npm run build" } }` e `{ "src": "api/**/*.ts", "use": "@vercel/node" }`
     - Rotas: `"/api/(.*)" → "/api/$1"` e `"/(.*)" → "/index.html"`
     - Cron diário: `0 0 * * *` em `"/api/process-cron"`
2. Redeploy no Vercel a partir desse commit.
3. Ajustar `RESEND_API_KEY` em Vercel para a chave `re_...`.
4. Configurar domínio primário e redirecionamento 301 do alternativo.

## Endurecer Frontend
- Trocar leituras diretas de JSON por verificação de status e content-type:
```
async function safeJson(r) {
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  if (!ct.includes('application/json')) throw new Error('Resposta não JSON')
  return r.json()
}
```
- Usar `safeJson` nas chamadas a `/api/send-email`.

## Validações
- SPA: `https://www.xyzlogicflow.tech` → 200; `https://xyzlogicflow.tech` → 200 ou 301 para o primário.
- API presente: `GET https://www.xyzlogicflow.tech/api/send-email` → 405.
- Envio real: `POST /api/send-email` com corpo de teste → 200 e JSON com `id`; se 401, revisar `RESEND_API_KEY`; se 500, aplicar env no deploy.
- Supabase Edge: chamar via `https://<PROJECT-REF>.functions.supabase.co/process-cron`.

## Resend DNS
- DKIM: `TXT resend._domainkey` com `p=...` e verificar no painel Resend após propagação.
- SPF:
  - Apex com Zoho: `TXT @ → "v=spf1 include:zohomail.com include:amazonses.com ~all"`; ou
  - Subdomínio dedicado: `TXT send → "v=spf1 include:amazonses.com ~all"` e `MX send → feedback-smtp.sa-east-1.amazonses.com`.
- Não alterar `MX @` se o recebimento é pelo Zoho.

## Entregáveis Hoje
- Deployment funcionando com `/api/send-email` e `/api/process-cron` publicados.
- SPA servida em domínio primário.
- Envio de e-mail validado com retorno de `id` do Resend.
- Frontend robusto contra resposta não-JSON.

Confirma que posso aplicar o plano para executar os commits, ajustar variáveis, fazer o redeploy e validar os endpoints? 