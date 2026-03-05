# 🔐 Configuração de Login - Usuário Desenvolvedor

## ✅ Usuário Criado com Sucesso!

**Credenciais:**
- 📧 **Email:** `logiccamila@gmail.com`
- 🔑 **Senha:** `Multi.13`
- 👤 **User ID:** `5371bf2b-57ec-41a1-880c-14f739611d25`

---

## 🌐 URLs de Acesso

- **Produção:** https://logic-view-bright.vercel.app/login
- **Alternativo:** https://logic-view-bright-main.vercel.app/login

---

## ⚠️ Se o Login Não Funcionar

### 1. **Confirmação de Email Pendente**

O Supabase pode estar configurado para exigir confirmação de email. Verifique:

- ✉️ Caixa de entrada do email `logiccamila@gmail.com`
- 🗑️ Pasta de **Spam** ou **Lixo Eletrônico**
- 📧 Procure por email de **"Confirm your email"** ou **"Supabase"**

### 2. **Resetar Senha**

Se não recebeu o email de confirmação:

1. Acesse: https://logic-view-bright.vercel.app/login
2. Clique em **"Esqueci minha senha"**
3. Digite: `logiccamila@gmail.com`
4. Verifique o email e redefina para: `Multi.13`

### 3. **Desabilitar Confirmação de Email (Supabase)**

Se você tem acesso ao painel do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Settings**
3. Desmarque **"Enable email confirmations"**
4. Tente fazer login novamente

### 4. **Confirmar Manualmente no Supabase**

Se tem acesso ao painel:

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Encontre `logiccamila@gmail.com`
4. Clique nos 3 pontinhos → **Confirm Email**

---

## 🔧 Scripts Disponíveis

### Criar/Recriar Usuário
```bash
./scripts/signup-developer.sh
```

### Verificar Status
```bash
# Ver se o usuário existe
grep "logiccamila" .env* -r
```

---

## 📞 Troubleshooting

### Erro: "Invalid login credentials"
- ✅ Verifique se confirmou o email
- ✅ Tente resetar a senha
- ✅ Confirme que digitou corretamente: `Multi.13` (M maiúsculo, ponto)

### Erro: "Email not confirmed"
- ✅ Verifique a caixa de entrada
- ✅ Use o painel do Supabase para confirmar manualmente

### Erro: "Too many requests"
- ✅ Aguarde 1 minuto e tente novamente
- ✅ O Supabase tem rate limiting de tentativas

---

## ✅ Próximos Passos Após Login

1. **Dashboard:** Você será redirecionado para `/dashboard`
2. **Permissions:** Como admin, terá acesso completo
3. **Testar:** Navegue pelas novas funcionalidades (animações, charts, etc)

---

## 🆘 Alternativa: Login Temporário

Se nada funcionar, você pode:

1. Ir para o código-fonte
2. Temporariamente desabilitar autenticação para testes
3. Ou criar um novo usuário diretamente no painel Supabase

---

**Última atualização:** 06/01/2026  
**Status:** ✅ Usuário criado e aguardando confirmação de email
