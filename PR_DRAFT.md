# PR: Remover integrações Firebase; adicionar CI e Docker

Resumo
- Remove arquivos e artefatos do Firebase
- Atualiza workflows de CI/CD (build/test, deploy Vercel, build GHCR)
- Corrige scripts auxiliares (`update-ci.ps1`, `push_https.ps1`) e documentação (`docs/deploy-ci.md`, `README.md`)
- Adiciona `migrations/001_grants.sql` para permissões Neon
- Redesenha o landing (hero, cards, fluxo) e moderniza o header/top navigation

O que revisar
- Verificar se a remoção do `lib/firebase*.ts/js` e `frontend/public/firebase-config.js` não quebra integrações esperadas.
- Rever `README.md` e `docs/*` adicionados.
- Validar visual da landing page e header responsivo (testar breakpoints mobile/desktop).

Como testar localmente
1. Checkout da branch: `git checkout ci/remove-firebase-vercel-neon`
2. Instalar dependências: `npm ci`
3. Rodar dev: `npm run dev` no frontend/backend conforme necessário

Deploy
- Após merge, o workflow `ci.yml` executará build & testes.
- O workflow `deploy-vercel.yml` roda em pushes para `main` quando `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estiverem configurados.

Segredos recomendados
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `NEON_DATABASE_URL`, `NEON_REST_URL`, `NEON_API_KEY`
- `GHCR_PAT` — se for publicar imagens no GitHub Container Registry (opcional)

Notas
- Vercel e Neon permanecem como provedores principais.
- Revise `docs/deploy-ci.md` para ver o passo a passo completo de CI/CD.
- Recomendo adicionar os segredos acima no repositório antes de mesclar e ativar deploys automáticos.
