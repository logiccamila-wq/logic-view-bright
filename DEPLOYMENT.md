# Deployment

Se a dúvida for **"onde está configurado o deploy na Azure ou a pipeline?"**, os arquivos principais são estes:

## 1. Pipeline de CI/CD

Arquivo: `.github/workflows/azure-deploy.yml`

Esse é o pipeline principal do repositório. Ele mostra:

- quando a automação roda (`push` e `pull_request` na branch `main`)
- o job de build com `npm ci`, `npm run check` e `npm run build`
- o job de deploy para Azure App Service

O deploy automático só acontece no `push` para `main` quando estas configurações existem no GitHub:

- secret `AZURE_CREDENTIALS`
- variable `AZURE_WEBAPP_NAME`

## 2. Configuração Azure

Arquivo: `azure.yaml`

Esse arquivo mostra como a aplicação é empacotada e iniciada no Azure App Service:

- `npm install`
- `npm run build`
- `npm start`

## 3. Entry point da aplicação publicada

Arquivo: `server/index.js`

Esse é o processo Node.js iniciado em produção para servir o frontend e as rotas `/api/runtime/*`.

## 4. Observação importante

O fluxo padrão deste repositório é **Azure App Service + GitHub Actions**.

O arquivo `AZURE_STATIC_WEB_APPS_DEPLOY.md` é apenas uma referência opcional para hospedar **somente o frontend** no Azure Static Web Apps. Ele **não** é o deploy principal usado hoje.
