## Objetivo
- Publicar `/api/send-email` e `/api/process-cron` no Vercel, ajustar ambientes (Resend/DOMÍNIO), e blindar o frontend para acabar com o erro “Unexpected token '<'”.

## Verificações (somente leitura)
- Conferir no deployment do Vercel se “Functions” lista `/api/send-email`.
- Validar `vercel.json` do deploy: apenas `builds` com:
  - `{ "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist", "buildCommand": "npm run build" } }`
  - `{ "src": "api/**/*.ts", "use": "@vercel/node" }`
  - Rotas: `"/api/(.*)" → "/api/$1"` antes de `"/(.*)" → "/index.html"`
- Confirmar envs no Vercel: `RESEND_API_KEY` (formato `re_...`), `ALLOWED_ORIGINS`.
- Validar que chamadas de cron do Supabase usam `https://<PROJECT-REF>.functions.supabase.co/process-cron`.

## Implementação (aplicar após aprovação)
1. Garantir arquivos de API e configuração no repositório usado pelo Vercel:
   - `api/send-email.ts` e `api/process-cron.ts` presentes.
   - `vercel.json` conforme verificação acima.
2. Redeploy do projeto no Vercel (painel/CLI) usando o commit que contém `api/*` e `vercel.json`.
3. Variáveis de ambiente:
   - Setar `RESEND_API_KEY=re_...` (chave real do Resend) em Production/Preview/Development.
4. Domínios:
   - Adicionar `xyzlogicflow.tech` ao projeto (além de `www`) e definir o primário; o alternativo fará redirect 301.
5. Frontend (blindagem):
   - Introduzir utilitário e trocar `return r.json()` por leitura segura em chamadas de API:
```
async function safeJson(r) {
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  if (!ct.includes('application/json')) throw new Error('Resposta não JSON')
  return r.json()
}
```
   - Aplicar em componentes que usam `fetch` (TripAlerts, GaelChatbot, EHS, Insurance, Developer, CostMonitoring, CRM).

## DNS – Resend
- DKIM: `TXT resend._domainkey` com o `p=...` (já adicionado; verificar no painel após propagação).
- SPF:
  - Apex com Zoho: `TXT @ → "v=spf1 include:zohomail.com include:amazonses.com ~all"`; ou
  - Subdomínio `send`: `TXT send → "v=spf1 include:amazonses.com ~all"` e `MX send → feedback-smtp.sa-east-1.amazonses.com`; usar `from: noreply@send.xyzlogicflow.tech`.
- Não alterar `MX @` se o recebimento continuar no Zoho.

## Validações
- SPA: `https://www.xyzlogicflow.tech` → 200; `https://xyzlogicflow.tech` → 200 ou 301 para o primário.
- API presente: `GET https://www.xyzlogicflow.tech/api/send-email` → 405.
- Envio real: `POST /api/send-email` com corpo de teste → 200 e JSON com `id` (se 401, revisar chave; se 500, aplicar env no deploy).
- Supabase Edge: `GET https://<PROJECT-REF>.functions.supabase.co/process-cron` → JSON.

## Entregáveis
- `/api/send-email` e `/api/process-cron` publicados e testados.
- SPA servida no domínio primário, sem “Unexpected token '<'”.
- Envio de e-mail via Resend validado com retorno de `id`.
- Frontend robusto contra resposta não‑JSON.

Confirma para eu executar agora e fechar tudo hoje?