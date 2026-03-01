# Credenciais de Acesso - OptiLog

## 🔐 Usuários Autorizados

### 1. Administrador Principal
- **Email:** logiccamila@gmail.com
- **Senha:** [redigida – defina via painel/ENV]
- **Role:** ADMIN
- **Permissões:** Acesso total a todos os módulos (*)
- **Status:** ✅ Verificado e Ativo

### 2. Administrador Secundário
- **Email:** camila.eteste@gmail.com
- **Senha:** [redigida – defina via painel/ENV]
- **Role:** ADMIN
- **Permissões:** Acesso total a todos os módulos (*)
- **Status:** ✅ Verificado e Ativo

### 3. Administrador Secundário (Alternativo)
- **Email:** camila.etseral@gmail.com
- **Senha:** [redigida – defina via painel/ENV]
- **Role:** ADMIN
- **Permissões:** Acesso total a todos os módulos (*)
- **Status:** ✅ Verificado e Ativo

### 4. Usuário de Teste
- **Email:** teste@teste.com
- **Senha:** [redigida – defina via painel/ENV]
- **Role:** VIEWER
- **Permissões:** dashboard, relatorios
- **Status:** ✅ Verificado e Ativo

---

## 🎭 Roles Disponíveis

### ADMIN
- Acesso total ao sistema
- Gerenciamento de usuários
- Todas as operações permitidas
- Módulos: * (todos)

### MANAGER
- Gestão operacional
- Visualização de relatórios avançados
- Aprovações e configurações

### DRIVER
- Acesso a rotas e entregas
- Checklist de veículos
- Registro de ocorrências

### MECHANIC
- Gestão de manutenção
- Registro de serviços
- Controle de peças

### VIEWER
- Apenas visualização
- Acesso limitado a módulos específicos
- Sem permissões de edição

---

## 📝 Sistema de Autenticação

### Validação de Credenciais
- ✅ Email e senha validados contra lista autorizada
- ✅ Verificação automática para usuários pré-autorizados
- ✅ Bloqueio de cadastro para emails não autorizados
- ✅ Controle de status (ativo/inativo)

### Fluxo de Login
1. Usuário insere email e senha
2. Sistema valida contra `lib/permissions.ts`
3. Se autorizado → Login com permissões
4. Se não autorizado → Mensagem de erro
5. Usuário redirecionado para `/dashboard`

### Cadastro
- ❌ **Bloqueado para novos usuários**
- Apenas emails pré-autorizados podem fazer login
- Mensagem exibida: "Cadastro restrito. Entre em contato com o administrador."

---

## 🚀 Como Adicionar Novo Usuário

Edite o arquivo `/lib/permissions.ts` e adicione:

```typescript
'novo.email@exemplo.com': {
  email: 'novo.email@exemplo.com',
  role: UserRole.VIEWER, // ou ADMIN, MANAGER, etc
  modules: ['dashboard', 'relatorios'], // ou ['*'] para todos
  verified: true,
  active: true,
},
```

E a senha em:

```typescript
'novo.email@exemplo.com': 'SuaSenhaAqui123',
```

---

## 🌐 URLs de Acesso

- **Produção:** https://optilog-app-logiccamila-wqs-projects.vercel.app
- **Login:** https://optilog-app-logiccamila-wqs-projects.vercel.app/login
- **Dashboard:** https://optilog-app-logiccamila-wqs-projects.vercel.app/dashboard

---

## ⚠️ Segurança

### Para Produção:
1. **URGENTE:** Implementar hash de senhas (bcrypt)
2. Mover credenciais para banco de dados
3. Implementar email de confirmação real
4. Adicionar 2FA para admins
5. Logs de auditoria de acesso
6. Rate limiting em login

### Arquivo Atual:
- Senhas eram registradas em texto plano em `lib/permissions.ts` (removidas nesta revisão)
- **NÃO COMMITAR SENHAS REAIS NO GIT** — use variáveis de ambiente e hash (bcrypt)
- Para ambientes de teste, defina credenciais via painel de admin seguro ou seeds controlados

---

**Data de Criação:** 27/10/2025  
**Última Atualização:** Deploy 94a91c9
