# Como configurar alertas automáticos

## Vercel
- Configure alertas de erro e downtime no dashboard Vercel (Settings > Notifications)
- Ative integração com Slack, e-mail ou webhook para avisos em tempo real

## Sentry (opcional)
- Instale o pacote: `npm install @sentry/nextjs`
- Configure no `sentry.config.js` e no projeto Next.js
- Monitore erros de frontend e backend em tempo real

## Monitoramento customizado
- Use o script `monitor_api.js` para monitoramento simples
- Integre com serviços como UptimeRobot, StatusCake ou PagerDuty para alertas avançados

---
Essas opções garantem que falhas críticas sejam detectadas e notificadas rapidamente para ação imediata.
