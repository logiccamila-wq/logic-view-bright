Guia rápido para atualizar a cópia local no Windows

Objetivo: sincronizar a pasta local `C:\Users\Camila Lareste\Documents\optilog.app-main` com o repositório GitHub `logiccamila-wq/optilog.app`.

Opções: você pode usar o script PowerShell `scripts/update-windows.ps1` incluído no repositório ou executar os comandos manualmente.

1) Usando o script (recomendado)
- Abra o PowerShell como Administrador.
- Rode:

  # Exemplo
  cd ~
  pwsh ./path/to/optilog.app/scripts/update-windows.ps1

- O script fará um clone se a pasta não existir, ou criará um backup local e fará reset hard para `origin/main`.

2) Comandos manuais
- Abra PowerShell e execute:

  cd "C:\Users\Camila Lareste\Documents\optilog.app-main"
  # Se não for um repositório git:
  git clone https://github.com/logiccamila-wq/optilog.app.git .

  # Se já for git:
  git fetch --all
  git checkout -b local-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')
  git checkout main
  git reset --hard origin/main
  git clean -fd

3) Após sincronizar
- Instale dependências:
  npm install
- Rode build e dev:
  npm run build
  npm run dev
- Para testes E2E (Playwright):
  npx playwright test tests/e2e/usuarios.spec.ts --reporter=list

4) Problemas de login / env
Se o login falhar após atualizar, verifique as variáveis de ambiente necessárias no arquivo `.env.local` ou nas configurações do ambiente:
- NEXT_PUBLIC_STACK_AUTH_PROJECT_ID
- NEXT_PUBLIC_STACK_AUTH_JWKS_URL
- JWT_SECRET
- DATABASE_URL (Azure PostgreSQL)

No Windows, você pode criar um arquivo `.env.local` na raiz do projeto com conteúdo como:

JWT_SECRET=ba32d52e1bf0e80476cbdce482500830fe0cf23d39e732b926d4e964e1fdae73
NEXT_PUBLIC_STACK_AUTH_PROJECT_ID=b0e4c9fa-4c2f-4870-a244-782996d4b593
NEXT_PUBLIC_STACK_AUTH_JWKS_URL=https://api.stack-auth.com/api/v1/projects/b0e4c9fa-4c2f-4870-a244-782996d4b593/.well-known/jwks.json
DATABASE_URL="postgresql://..."

5) Se precisar de ajuda
- Se ocorrerem erros ao rodar build ou testes, copie o log e me envie. Posso diagnosticar e aplicar correções no código aqui e você apenas puxará as mudanças com o script.

Notas de segurança
- Não compartilhe segredos em PRs públicas. Use `.env.local` e proteja as credenciais.
