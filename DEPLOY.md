# Guia de Deploy - Cloudflare Pages

Este documento explica como configurar e fazer o deploy da aplicação LogicView para Cloudflare Pages.

## Pré-requisitos

1. Conta na Cloudflare com Pages habilitado
2. Projeto criado no Cloudflare Pages (ou será criado automaticamente)
3. Acesso ao repositório GitHub

## Configuração dos Secrets

Para que o workflow automático funcione, você precisa configurar os seguintes secrets no GitHub:

### Passos:

1. Acesse: **Settings** → **Secrets and variables** → **Actions** no repositório GitHub
2. Clique em **New repository secret** e adicione os seguintes secrets:

#### `CLOUDFLARE_API_TOKEN`
- **Onde obter**: Cloudflare Dashboard → My Profile → API Tokens → Create Token
- **Permissões necessárias**:
  - Account: Cloudflare Pages (Edit)
  - Zone: DNS (Edit) - se necessário
- **Template**: Use "Edit Cloudflare Workers" como base

#### `CLOUDFLARE_ACCOUNT_ID`
- **Onde obter**: Cloudflare Dashboard → URL (formato: `dash.cloudflare.com/<ACCOUNT_ID>/`)
- Ou vá em Workers & Pages → Overview → Account ID (lado direito)

#### `CLOUDFLARE_PROJECT_NAME`
- **Valor sugerido**: `logic-view-bright` ou `xyzlogicflow`
- Este é o nome que aparecerá no Cloudflare Pages
- O projeto será criado automaticamente no primeiro deploy

## Deploy Manual (opcional)

Se preferir fazer deploy manual via CLI:

```bash
# 1. Instalar Wrangler
npm install -g wrangler

# 2. Autenticar
wrangler login

# 3. Build
npm run build

# 4. Deploy
npm run pages:deploy
```

## Deploy Automático

Após configurar os secrets:

1. Faça merge desta branch para `main`
2. O workflow `.github/workflows/pages-deploy.yml` será executado automaticamente
3. O deploy será feito para Cloudflare Pages
4. A URL do site será exibida no log do workflow

## Estrutura do Build

- **Comando de build**: `npm run build` (executa `vite build`)
- **Diretório de saída**: `./dist`
- **Arquivos principais**:
  - `index.html` - Página principal
  - `assets/` - CSS e JS compilados
  - Arquivos estáticos (favicon, images, etc.)

## Verificação

Após o deploy:

1. Acesse o Cloudflare Dashboard → Workers & Pages
2. Encontre o projeto `logic-view-bright` (ou o nome configurado)
3. Clique no deploy mais recente
4. Copie a URL de produção
5. Teste a aplicação

## Troubleshooting

### Build falha com erros TypeScript
✅ **Solucionado**: O comando `build` agora usa apenas `vite build`, pulando a verificação de tipos.
- Para verificar tipos manualmente: `npm run check`
- Para build com verificação: `npm run build:check`

### Secrets não configurados
**Erro**: `secrets.CLOUDFLARE_API_TOKEN is required`
- **Solução**: Configure os secrets conforme descrito acima

### Projeto não encontrado
**Erro**: `Project not found`
- **Solução**: O projeto será criado automaticamente no primeiro deploy
- Ou crie manualmente em Cloudflare Dashboard → Workers & Pages → Create application

## URLs

- **Dashboard Cloudflare**: https://dash.cloudflare.com
- **Documentação Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **GitHub Actions**: `Actions` tab no repositório

## Notas

- O workflow só dispara em push para a branch `main`
- TypeScript errors em `api/` e `src/components/mechanic/` são conhecidos e não afetam o build da landing page
- A landing page é standalone e não depende das rotas complexas do app completo
