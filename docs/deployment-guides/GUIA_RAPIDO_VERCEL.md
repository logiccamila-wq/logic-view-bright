# 🎯 GUIA RÁPIDO: Remover Cloudflare e Usar Vercel

## ⚡ Passo a Passo Super Rápido

### 1️⃣ NO VERCEL (https://vercel.com/dashboard)
```
✅ Acesse seu projeto
✅ Settings → Domains
✅ Add Domain: xyzlogicflow.tech
✅ Escolha: "Use Vercel Nameservers"
✅ ANOTE: ns1.vercel-dns.com e ns2.vercel-dns.com
✅ Add Domain: www.xyzlogicflow.tech
```

### 2️⃣ NA HOSTINGER (https://hpanel.hostinger.com/)
```
✅ Domínios → xyzlogicflow.tech
✅ DNS / Nameservers
✅ "Alterar servidores de nomes"
✅ Usar nameservers customizados:
   → ns1.vercel-dns.com
   → ns2.vercel-dns.com
✅ Salvar
```

### 3️⃣ AGUARDAR
```
⏱️ 24-48 horas para propagação completa
🔍 Verificar: ./scripts/check-dns.sh
```

### 4️⃣ REMOVER DO CLOUDFLARE (opcional)
```
❌ dash.cloudflare.com
❌ xyzlogicflow.tech → Overview
❌ Remove Site from Cloudflare
⚠️ Faça isso só DEPOIS que tudo funcionar!
```

---

## 📖 Guia Completo
Veja todos os detalhes em: **[MIGRAR_CLOUDFLARE_VERCEL.md](MIGRAR_CLOUDFLARE_VERCEL.md)**

---

## ✅ Como Saber que Funcionou

```bash
# Verificar nameservers
dig NS xyzlogicflow.tech +short
# Deve mostrar: ns1.vercel-dns.com e ns2.vercel-dns.com

# Verificar site
curl -I https://xyzlogicflow.tech
# Deve retornar: HTTP/2 200

# Ou use o script
./scripts/check-dns.sh
```

---

**Status:** Pronto para migração  
**Tempo estimado:** 10 minutos de configuração + 24-48h de propagação  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
