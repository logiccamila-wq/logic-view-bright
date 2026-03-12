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

## 2. Configuração Azure para empacotamento e runtime

Arquivo: `azure.yaml`

Esse arquivo mostra o fluxo de empacotamento e inicialização configurado no repositório:

- `npm install`
- `npm run build`
- `npm start`

## 3. Arquivos de runtime para conferir

- `server/index.js` - entry point Node.js usado quando o app roda como servidor publicado
- `api/runtime/index.js` - handlers compartilhados do runtime/API usados na camada Azure

## 4. Azure Static Web Apps

Arquivo: `AZURE_STATIC_WEB_APPS_DEPLOY.md`

Esse documento mostra o caminho alternativo/dirigido a Azure Static Web Apps para frontend e explica quais ajustes seriam necessários nesse modelo.

## 5. Como responder rápido

Se você quer descobrir **onde olhar**:

- pipeline do GitHub: `.github/workflows/azure-deploy.yml`
- configuração Azure do app: `azure.yaml`
- runtime/backend: `api/runtime/index.js` e `server/index.js`
- documentação específica de Static Web Apps: `AZURE_STATIC_WEB_APPS_DEPLOY.md`
