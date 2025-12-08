## Objetivo
- Publicar `/api/send-email` e `/api/process-cron` no Vercel, corrigir `RESEND_API_KEY`, organizar domínios e blindar o frontend para eliminar “Unexpected token '<'”.

## Verificações (sem alteração)
- Confirmar que o deployment ativo contém funções em “Functions” (aparecem `/api/send-email`).
- Verificar `vercel.json` do deploy: apenas `builds` (sem `functions`), com:
  - `{ "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist", "buildCommand": "npm run build" } }`
  - `{ "src": "api/**/*.ts", "use": "@vercel/node" }`
  - Rotas: `"/api/(.*)" → "/api/$1"` antes de `"/(.*)" → "/index.html"`
- Validar env no Vercel: `RESEND_API_KEY` (formato `re_...`), `ALLOWED_ORIGINS` correto.

## Implementação (Vercel)
1. Garantir arquivos no repositório usado pelo projeto:
   - `api/send-email.ts:1` (já criado) e `api/process-cron.ts:4`.
   - `vercel.json:3–13` conforme acima.
2. Redeploy no Vercel usando o commit/branch com esses arquivos.
3. Variáveis:
   - Ajustar `RESEND_API_KEY` para a chave `re_...` (não URL) em Production/Preview/Development.
4. Domínios:
   - Adicionar `xyzlogicflow.tech` ao projeto (além de `www`) e definir o primário. O alternativo redireciona 301.

## Supabase Edge
- Usar URL de funções do Supabase para cron: `https://<PROJECT-REF>.functions.supabase.co/process-cron` (arquivo `supabase/functions/process-cron/index.ts:1`).
- Garantir CORS via `ALLOWED_ORIGINS` e segredos (`SUPABASE_SERVICE_ROLE_KEY`).

## Frontend (blindagem)
- Introduzir utilitário `safeJson(r)` e substituir `return r.json()` nas chamadas a `/api/send-email`:
```
async function safeJson(r) {
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  if (!ct.includes('application/json')) throw new Error('Resposta não JSON')
  return r.json()
}
```
- Tratar `ERR_ABORTED` como erro de navegação/rede (exibir mensagem e permitir reenvio).

## Resend DNS (envio)
- DKIM: `TXT resend._domainkey` com `p=...` (verificar no painel após propagação).
- SPF:
  - Apex com Zoho: `TXT @ → "v=spf1 include:zohomail.com include:amazonses.com ~all"`; ou
  - Subdomínio `send`: `TXT send → "v=spf1 include:amazonses.com ~all"` e `MX send → feedback-smtp.sa-east-1.amazonses.com`; usar `from: noreply@send.xyzlogicflow.tech`.
- Não alterar `MX @` se o recebimento é pelo Zoho.

## Validações
- SPA: `https://www.xyzlogicflow.tech` → 200; `https://xyzlogicflow.tech` → 200 ou 301 para o primário.
- API presente: `GET https://www.xyzlogicflow.tech/api/send-email` → 405.
- Envio real: `POST /api/send-email` com corpo de teste → 200 e JSON com `id`; se 401, revisar `RESEND_API_KEY`; se 500, aplicar env no deploy.
- Supabase Edge: `GET https://<PROJECT-REF>.functions.supabase.co/process-cron` → JSON.

## Entregáveis hoje
- `/api/send-email` e `/api/process-cron` publicados e validados.
- SPA no domínio primário, sem “Unexpected token '<'”.
- Envio de e-mail via Resend com `id` retornado.
- Frontend robusto contra resposta não‑JSON.

Aprova aplicar estas etapas agora para executar e fechar hoje?