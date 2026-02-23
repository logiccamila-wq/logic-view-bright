# 🔑 Como Obter API Key do Odoo.com - Guia Visual Rápido

**Data:** 03/02/2026  
**Atualização:** Documentação expandida com instruções detalhadas

---

## 📍 Onde Está a API Key?

```
🌐 Odoo.com
    ↓
👤 Minha Conta (My Account)
    ↓
🔒 Account Security (Segurança da Conta)
    ↓
🔑 Developer API Keys ← AQUI!
    ↓
➕ New API Key (Nova Chave)
```

---

## ⚡ Passo a Passo Rápido

### 1️⃣ Acesse o Odoo.com
- URL: https://www.odoo.com/my/home
- Faça login com seu usuário e senha

### 2️⃣ Vá para Minha Conta
- Clique no seu nome (canto superior direito)
- Selecione **"My Account"**

### 3️⃣ Abra Account Security
- Clique na aba **"Account Security"**
- Ou acesse direto: https://www.odoo.com/my/security

### 4️⃣ Encontre Developer API Keys
- Role a página até a seção **"Developer API Keys"**
- Esta é a seção oficial para gerenciar chaves de API

### 5️⃣ Crie uma Nova Chave
- Clique em **"New API Key"**
- Digite um nome: `Logic View Bright`
- Clique em **"Generate Key"**

### 6️⃣ Copie a Chave
- ⚠️ **ATENÇÃO:** Mostrada apenas UMA vez!
- Copie imediatamente
- Cole no formulário do Logic View Bright

---

## 🔗 Links Úteis

| Link | Para Que Serve |
|------|----------------|
| https://www.odoo.com/my/home | Dashboard principal |
| https://www.odoo.com/my/security | Connection & Security Page ⭐ |
| https://xyzlogicflow.tech/settings/odoo | Configurar integração |

---

## 📝 Informações Necessárias

Para configurar a integração, você precisa de:

```
┌─────────────────────────────────────────┐
│ 1. URL do Odoo                          │
│    https://xyzlogicflow.odoo.com        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 2. Nome do Banco de Dados               │
│    xyzlogicflow                         │
│    (mesmo do subdomínio)                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 3. Usuário / E-mail                     │
│    seu@email.com                        │
│    (login do Odoo)                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 4. Chave API ⭐ IMPORTANTE              │
│    abc123xyz... (do passo 6 acima)      │
└─────────────────────────────────────────┘
```

---

## ⚠️ Importante: Use API Key, Não Senha!

### ✅ Vantagens da API Key

| Vantagem | Explicação |
|----------|------------|
| 🔒 **Mais Segura** | Não expõe sua senha principal |
| 🔄 **Revogável** | Pode cancelar sem mudar senha |
| 📊 **Rastreável** | Odoo monitora uso de cada chave |
| 🔢 **Múltiplas** | Pode criar várias (dev, prod, etc.) |

### ❌ Problemas da Senha

| Problema | Explicação |
|----------|------------|
| ⚠️ **Menos Segura** | Expõe credencial principal |
| 🔐 **Difícil Revogar** | Precisa trocar em todos lugares |
| 👁️ **Sem Rastreio** | Difícil saber de onde vem acesso |

---

## 🛡️ Boas Práticas

### ✅ Faça Isso

1. **Nomeie suas chaves descritivamente**
   - ✅ "Logic View Bright - Produção"
   - ✅ "TMS Integration - Desenvolvimento"
   - ❌ "Chave 1", "API Key"

2. **Use chaves diferentes por ambiente**
   - Uma para desenvolvimento
   - Outra para produção
   - Facilita revogação se houver problema

3. **Revise periodicamente**
   - Acesse https://www.odoo.com/my/security mensalmente
   - Revogue chaves não usadas
   - Recrie chaves antigas (rotação)

4. **Revogue se comprometida**
   - Se suspeitar que chave vazou
   - Revogue imediatamente
   - Crie uma nova

### ❌ Não Faça Isso

- ❌ Compartilhar API Key publicamente
- ❌ Commitar no git
- ❌ Usar mesma chave em dev e prod
- ❌ Deixar chaves antigas ativas

---

## 🔧 Como Revogar uma Chave

Se precisar revogar (cancelar) uma chave:

1. Acesse: https://www.odoo.com/my/security
2. Encontre a chave na lista **"Developer API Keys"**
3. Clique em **"Revoke"** ao lado da chave
4. Confirme a revogação
5. Se necessário, crie uma nova chave

---

## 📱 Uso no Logic View Bright

Depois de obter a API Key:

1. Acesse: https://xyzlogicflow.tech/settings/odoo
2. Preencha os campos (URL, Database, Usuário, **API Key**)
3. Clique em **"Salvar Configuração"**
4. Clique em **"Testar Conexão"**
5. Se OK ✅, clique em **"Sincronizar Agora"**

---

## ❓ Problemas Comuns

### "Não encontro Developer API Keys"

➡️ Verifique:
- Você está em https://www.odoo.com/my/security?
- Rolou a página até o final?
- Está logado no Odoo.com?

### "Falha na autenticação"

➡️ Verifique:
- Copiou a chave completa?
- Não adicionou espaços extras?
- A chave não foi revogada?
- O usuário está correto?

### "Onde fica Connection & Security Page?"

➡️ É a página:
- https://www.odoo.com/my/security
- Ou: My Account → Account Security

---

## 📚 Documentação Relacionada

Para mais detalhes, consulte:

- **[SOBRE_INTEGRACAO.md](./SOBRE_INTEGRACAO.md)** - Resumo rápido
- **[INTEGRACAO_ODOO.md](./INTEGRACAO_ODOO.md)** - Guia completo
- **[Documentação Odoo Oficial](https://www.odoo.com/documentation/18.0/developer/api/external_api.html)** - API técnica

---

## ✨ Resumo

1. **Acesse:** https://www.odoo.com/my/security
2. **Encontre:** Developer API Keys
3. **Crie:** New API Key com nome descritivo
4. **Copie:** A chave (só 1x!)
5. **Use:** No Logic View Bright (/settings/odoo)

**Pronto!** Agora você tem uma integração segura com o Odoo! 🎉

---

**Mantido por:** Logic View Bright Team  
**Última atualização:** 03/02/2026  
**Versão:** 1.1.0
