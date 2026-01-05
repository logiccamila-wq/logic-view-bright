# Configuração de Domínio xyzlogicflow.tech no Vercel

## 📋 Situação Atual
- **Domínio:** xyzlogicflow.tech
- **Registrar:** Hostinger
- **Nameservers:** Cloudflare (anna.ns.cloudflare.com / mario.ns.cloudflare.com)
- **Deploy:** Vercel

## ✅ Passo a Passo Completo

### 1. Adicionar Domínio no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Domains**
3. Adicione os seguintes domínios:
   - `xyzlogicflow.tech`
   - `www.xyzlogicflow.tech`

O Vercel vai mostrar os registros DNS necessários. Anote-os!

---

### 2. Configurar DNS no Cloudflare

Como seus nameservers estão no Cloudflare, você precisa configurar os registros DNS lá:

#### 🔐 Acesse o Cloudflare Dashboard

1. Vá para [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecione o domínio **xyzlogicflow.tech**
3. Vá em **DNS** → **Records**

#### 📝 Adicionar Registros DNS

O Vercel vai fornecer registros específicos, mas geralmente são:

**Para o domínio raiz (xyzlogicflow.tech):**

| Tipo | Nome | Conteúdo | Proxy Status | TTL |
|------|------|----------|--------------|-----|
| A | @ | 76.76.21.21 | DNS only (cinza) | Auto |

**Para o subdomínio www:**

| Tipo | Nome | Conteúdo | Proxy Status | TTL |
|------|------|----------|--------------|-----|
| CNAME | www | cname.vercel-dns.com | DNS only (cinza) | Auto |

> ⚠️ **IMPORTANTE:** 
> - Use **DNS only** (ícone da nuvem cinza) e não "Proxied" (laranja)
> - Os valores podem variar. Use os valores exatos fornecidos pelo Vercel!

---

### 3. Configuração Alternativa (Nameservers do Vercel)

Se preferir usar os nameservers do Vercel diretamente:

#### Na Hostinger:
1. Vá em **Meus domínios** → **xyzlogicflow.tech**
2. Clique em **DNS / Nameservers**
3. Selecione **"Alterar servidores de nomes"**
4. Adicione os nameservers do Vercel:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

> ⚠️ **Cuidado:** Esta opção remove os benefícios do Cloudflare (CDN, proteção DDoS, etc.)

---

## 🔍 Verificação dos Registros DNS

Após configurar, verifique a propagação:

### Via Terminal:
```bash
# Verificar registro A
dig xyzlogicflow.tech +short

# Verificar registro CNAME do www
dig www.xyzlogicflow.tech +short

# Verificar nameservers
dig NS xyzlogicflow.tech +short
```

### Via Online:
- [DNS Checker](https://dnschecker.org)
- [What's My DNS](https://whatsmydns.net)

---

## ⏱️ Tempo de Propagação

- **Cloudflare → Vercel:** 5-30 minutos (geralmente rápido)
- **Mudança de Nameservers:** 24-48 horas (pode demorar mais)

---

## ✅ Checklist Final

- [ ] Domínio adicionado no Vercel
- [ ] Registros DNS configurados no Cloudflare
- [ ] Status "DNS only" (cinza) nos registros
- [ ] Verificação de DNS propagado
- [ ] HTTPS configurado automaticamente pelo Vercel
- [ ] Teste de acesso: https://xyzlogicflow.tech
- [ ] Teste de redirecionamento: https://www.xyzlogicflow.tech

---

## 🆘 Troubleshooting

### Erro: "Invalid Configuration"
- Verifique se o domínio está com status "DNS only" no Cloudflare
- Remova e adicione o domínio novamente no Vercel

### DNS não propaga
- Aguarde até 48 horas
- Use `dig` para verificar se os registros estão corretos
- Limpe o cache DNS: `sudo systemd-resolve --flush-caches`

### HTTPS não funciona
- O Vercel provisiona certificados automaticamente
- Aguarde 5-10 minutos após a propagação DNS
- Certifique-se de que os registros DNS estão corretos

---

## 📚 Recursos Úteis

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Vercel + Cloudflare Guide](https://vercel.com/guides/using-cloudflare-with-vercel)

---

## 🎯 Recomendação

**Mantenha os nameservers do Cloudflare** e apenas adicione os registros DNS apontando para o Vercel. Assim você tem:

✅ CDN do Cloudflare  
✅ Proteção DDoS  
✅ Analytics do Cloudflare  
✅ Deploy e Edge Functions do Vercel  
✅ Melhor performance geral  

---

**Última atualização:** 05/01/2026
