
# Optilog.app - Super Gestor

Aplicação web para operações logísticas construída em Next.js/React, com autenticação via Stack Auth e persistência de dados no Neon Postgres.

## Tecnologias principais

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Autenticação:** Stack Auth (OAuth, magic links, e-mail)
- **Banco de dados:** Neon Postgres (drivers nativos e API REST)
- **Infra/CI:** GitHub Actions (build/test/deploy) e Vercel
## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Configure as variáveis de ambiente (`.env.local` ou variáveis do sistema):
   - `STACK_AUTH_PROJECT_ID`
   - `STACK_AUTH_JWKS_URL`
   - `STACK_AUTH_OAUTH_GITHUB_CLIENT_ID`, `STACK_AUTH_OAUTH_GITHUB_CLIENT_SECRET`
   - `STACK_AUTH_OAUTH_GOOGLE_CLIENT_ID`, `STACK_AUTH_OAUTH_GOOGLE_CLIENT_SECRET`
   - `NEON_DATABASE_URL`
   - `NEON_REST_URL`
   - `NEON_API_KEY`

3. Execute o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000)
## Scripts úteis

- `npm run dev`: inicia o modo desenvolvimento
- `npm run build`: gera artefatos de produção
- `npm start`: executa a build em produção
- `npm test` / `npm run lint`: testes e lint
## CI/CD

- `.github/workflows/ci.yml`: instala dependências, roda lint/test/build
- `.github/workflows/deploy-vercel.yml`: deploy automático na Vercel
- `.github/workflows/build-and-publish-image.yml`: constrói imagem Docker e publica no GHCR
## Deploy em produção

1. Faça o build local para garantir que tudo está funcionando:

   ```bash
   npm install
   npm run build
   npm run start:prod
   ```

2. Faça o deploy:

   ```bash
   git add -A
   git commit -m "chore: preparação go-live"
   git push origin main
   ```

3. Acompanhe o build e logs no dashboard da Vercel.
4. URL de produção: [https://optilog-app.vercel.app](https://optilog-app.vercel.app)
## Pós Go-Live

- Monitore erros críticos, performance e feedback da equipe.
- Consulte o arquivo `GO_LIVE_CHECKLIST.md` para checklist completo de produção e rollback.
- Documente bugs em `KNOWN_ISSUES.md`.
- Atualize o `CHANGELOG.md` a cada release.
- Consulte o `USER_GUIDE.md` para dúvidas frequentes e suporte.
- Acompanhe o andamento e planejamento contínuo em `PROXIMOS_PASSOS.md`.
## Critérios de Sucesso

- Sistema acessível
- Zero erros críticos
- Feedback positivo da equipe
- Performance dentro do esperado
- Todas funcionalidades operacionais
## Contatos de Emergência

- **DevOps:** devops@optilog.app
- **DBA:** dba@optilog.app
- **Vercel Support:** [https://vercel.com/support](https://vercel.com/support)
- **Neon Support:** [https://neon.tech/docs/introduction/support](https://neon.tech/docs/introduction/support)
## Métricas de Impacto

- 48 módulos implementados
- 95/100 pontos (Top 2% Brasil)
- 98% probabilidade ganhar editais
- Economia: R$ 441k/ano (tributária), R$ 827k/ano (operacional)
- ROI: 1.492% | Payback: 24 dias
# Optilog.app# Optilog.app# Super Gestor - Plataforma de Gestão Inteligente



Aplicação web para operações logísticas construída em Next.js/React, com autenticação via Stack Auth e persistência de dados no Neon Postgres.



## Tecnologias principaisAplicação web de logística construída em Next.js/React com autenticação Stack Auth e persistência no Neon Postgres.Super Gestor é uma plataforma de gestão de tarefas e conformidade, construída com Next.js, Firebase e Inteligência Artificial (Genkit). O projeto foi desenhado para organizar e monitorar fluxos de trabalho, garantindo conformidade com normas como a ISO 9001 e oferecendo insights inteligentes para otimização de processos.

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui

- **Autenticação:** Stack Auth (OAuth, magic links, e-mail)

- **Banco de dados:** Neon Postgres (drivers nativos e API REST)

- **Infra/CI:** GitHub Actions (build/test/deploy) e GitHub Container Registry## Tecnologias principais## ✨ Funcionalidades Principais

- **Deploy:** Vercel para frontend e serviços opcionais em container

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui

## Rodando localmente

1. Instale as dependências- **Autenticação**: Stack Auth (OAuth, magic links e e-mail)-   **Fluxo de Atividades:** Acompanhe tarefas em tempo real, organizadas em um painel interativo.

   ```bash

   npm ci- **Banco de dados**: Neon Postgres (API REST ou drivers nativos)-   **Criação de Tarefas:** Adicione novas atividades ao fluxo de trabalho de forma simples e rápida.

   ```

2. Configure as variáveis de ambiente (arquivo `.env.local` ou variáveis do sistema):- **Pipelines**: GitHub Actions para CI/CD, Vercel para deploy do frontend, GHCR para imagens Docker-   **Visualização de Conformidade:** Monitore o status de conformidade com a ISO 9001 através de um gráfico de pizza intuitivo.

   - `STACK_AUTH_PROJECT_ID`

   - `STACK_AUTH_JWKS_URL`-   **Insights com Supergestor IA:** Uma Inteligência Artificial integrada que analisa o fluxo de trabalho para identificar gargalos, sugerir otimizações e melhorar a eficiência geral.

   - `STACK_AUTH_OAUTH_GITHUB_CLIENT_ID`, `STACK_AUTH_OAUTH_GITHUB_CLIENT_SECRET`

   - `STACK_AUTH_OAUTH_GOOGLE_CLIENT_ID`, `STACK_AUTH_OAUTH_GOOGLE_CLIENT_SECRET`## Como rodar localmente

   - `NEON_DATABASE_URL`

   - `NEON_REST_URL`1. `npm ci`## 🛠️ Tecnologias Utilizadas

   - `NEON_API_KEY`

3. Execute o ambiente de desenvolvimento2. Configurar variáveis de ambiente (veja abaixo)

   ```bash

   npm run dev3. `npm run dev`-   **Frontend:** Next.js, React, TypeScript, Tailwind CSS

   ```

4. Abra `http://localhost:3000`-   **Componentes:** shadcn/ui



## Scripts úteis## Variáveis de ambiente sugeridas-   **Backend & Banco de Dados:** Firebase (Authentication, Firestore)

- `npm run dev`: inicia o modo desenvolvimento

- `npm run build`: gera artefatos de produção- `STACK_AUTH_PROJECT_ID`-   **Inteligência Artificial:** Genkit / Google AI (Gemini)

- `npm start`: executa a build em produção

- `npm test` / `npm run lint`: testes e lint (quando disponíveis)- `STACK_AUTH_JWKS_URL`-   **Hospedagem:** Firebase App Hosting



## Pipelines de CI/CD- `STACK_AUTH_OAUTH_*`

- `.github/workflows/ci.yml`: instala dependências, roda lint/test/build nos diretórios detectados; publica artefatos

- `.github/workflows/deploy-vercel.yml`: deploy automático na Vercel (exige `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)- `NEON_DATABASE_URL`## 🚀 Como Rodar o Projeto Localmente

- `.github/workflows/build-and-publish-image.yml`: constrói imagem Docker e publica no GHCR (opcional)

- `NEON_REST_URL`

Scripts auxiliares:

- `update-ci.ps1`: atualiza workflows e remove resquícios de Firebase- `NEON_API_KEY`Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

- `push_branch.ps1` / `push_https.ps1`: ajuda a publicar a branch `ci/remove-firebase-vercel-neon`

- `migrations/001_grants.sql`: concede privilégios básicos às roles `authenticated` e `anonymous` no Postgres



## Segredos recomendados (GitHub Actions)## CI/CD### 1. Pré-requisitos

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

- `NEON_DATABASE_URL`, `NEON_REST_URL`, `NEON_API_KEY`- `.github/workflows/ci.yml` executa lint, testes e build em múltiplos pacotes

- `STACK_AUTH_*` (IDs/segredos OAuth, JWKS)

- `GHCR_PAT` (se publicar imagens no GHCR)- `.github/workflows/deploy-vercel.yml` faz deploy não interativo na Vercel (requer `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)-   Node.js (v18 ou superior)



Consulte `docs/deploy-ci.md` para instruções detalhadas de CI/CD e deploy.- `.github/workflows/build-and-publish-image.yml` gera imagem Docker e publica no GitHub Container Registry-   npm ou yarn


- Scripts auxiliares: `push_branch.ps1`, `push_https.ps1`, `update-ci.ps1`

### 2. Clone o Repositório

Consulte `docs/deploy-ci.md` para detalhes sobre secrets e etapas adicionais de deploy.

```bash
git clone <URL_DO_SEU_REPOSITORIO_GIT>
cd optilog-app
/ /   t e s t   d e p l o y   p r e v i e w 
 
 # Deploy Mon Oct 27 07:16:09 PM UTC 2025
