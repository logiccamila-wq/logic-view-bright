import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Não autorizado')
    }

    console.log('Verificando alertas preditivos...')

    // Buscar alertas ativos
    const { data: alerts, error: alertsError } = await (supabaseClient as any)
      .from('predictive_alerts')
      .select('*')
      .eq('is_active', true)

    if (alertsError) throw alertsError

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum alerta ativo encontrado', alerts_checked: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Gerar previsão
    const { data: forecastData, error: forecastError } = await supabaseClient.functions.invoke('predict-revenue', {
      body: { months_ahead: 3 }
    })

    if (forecastError || !forecastData || forecastData.error) {
      console.error('Erro ao gerar previsão:', forecastError || forecastData?.error)
      throw new Error('Erro ao gerar previsão')
    }

    const predictions = forecastData.predictions
    const historicalData = forecastData.historical_data

    // Buscar metas configuradas
    const { data: targets, error: targetsError } = await (supabaseClient as any)
      .from('revenue_targets')
      .select('*')

    if (targetsError) throw targetsError

    const targetsMap = new Map<string, any>(
      targets?.map((t: any) => [`${t.ano}-${t.mes}`, t]) || []
    )

    // Calcular receita média histórica para baseline
    const avgHistoricalRevenue = historicalData.length > 0
      ? historicalData.reduce((sum: number, d: any) => sum + d.receita, 0) / historicalData.length
      : 0

    const alertsTriggered: any[] = []

    // Processar cada alerta
    for (const alert of alerts) {
      for (const prediction of predictions) {
        const predDate = new Date(prediction.mes + '-01')
        const mes = predDate.getMonth() + 1
        const ano = predDate.getFullYear()
        const targetKey = `${ano}-${mes}`
        const target: any = targetsMap.get(targetKey)

        let shouldTrigger = false
        let reason = ''
        let variancePercentage = 0

        // Verificar queda de receita vs histórico
        if (alert.alert_type === 'revenue_drop' && alert.threshold_percentage) {
          const dropPercentage = ((avgHistoricalRevenue - prediction.receita_prevista) / avgHistoricalRevenue) * 100
          
          if (dropPercentage > alert.threshold_percentage) {
            shouldTrigger = true
            variancePercentage = dropPercentage
            reason = `Previsão indica queda de ${dropPercentage.toFixed(1)}% na receita para ${predDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (R$ ${prediction.receita_prevista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vs média histórica de R$ ${avgHistoricalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
          }
        }

        // Verificar meta não atingida
        if (alert.check_target_miss && target && alert.target_threshold_percentage) {
          const targetMissPercentage = ((target.target_value - prediction.receita_prevista) / target.target_value) * 100
          
          if (targetMissPercentage > alert.target_threshold_percentage) {
            shouldTrigger = true
            variancePercentage = targetMissPercentage
            reason = `Meta de ${predDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} não será atingida. Previsão: R$ ${prediction.receita_prevista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, Meta: R$ ${target.target_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${targetMissPercentage.toFixed(1)}% abaixo)`
          }
        }

        // Se deve disparar alerta
        if (shouldTrigger) {
          // Verificar se já foi disparado recentemente (últimas 24h)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          
          const { data: recentAlerts } = await (supabaseClient as any)
            .from('predictive_alert_history')
            .select('*')
            .eq('alert_id', alert.id)
            .eq('mes_previsto', mes)
            .eq('ano_previsto', ano)
            .gte('created_at', oneDayAgo.toISOString())
            .limit(1)

          if (recentAlerts && recentAlerts.length > 0) {
            console.log(`Alerta já disparado recentemente: ${alert.alert_name} - ${reason}`)
            continue
          }

          // Registrar no histórico
          const { error: historyError } = await (supabaseClient as any)
            .from('predictive_alert_history')
            .insert({
              alert_id: alert.id,
              mes_previsto: mes,
              ano_previsto: ano,
              predicted_value: prediction.receita_prevista,
              target_value: target?.target_value || null,
              variance_percentage: variancePercentage,
              alert_reason: reason,
              notification_sent: true
            })

          if (historyError) {
            console.error('Erro ao registrar histórico:', historyError)
          }

          // Atualizar contador do alerta
          await (supabaseClient as any)
            .from('predictive_alerts')
            .update({
              last_triggered_at: new Date().toISOString(),
              trigger_count: alert.trigger_count + 1
            })
            .eq('id', alert.id)

          // Preparar notificações
          const notifications = []

          // Email
          if (alert.email_recipients && alert.email_recipients.length > 0) {
            notifications.push({
              type: 'email',
              recipients: alert.email_recipients,
              subject: `⚠️ Alerta Preditivo: ${alert.alert_name}`,
              body: reason
            })
          }

          // WhatsApp
          if (alert.whatsapp_enabled && alert.whatsapp_numbers && alert.whatsapp_numbers.length > 0) {
            notifications.push({
              type: 'whatsapp',
              numbers: alert.whatsapp_numbers,
              message: `⚠️ *Alerta Preditivo*\n\n*${alert.alert_name}*\n\n${reason}\n\nConfiança: ${prediction.confianca}%`
            })
          }

          // n8n
          if (alert.n8n_enabled && alert.n8n_webhook_url) {
            notifications.push({
              type: 'n8n',
              webhook_url: alert.n8n_webhook_url,
              payload: {
                alert_name: alert.alert_name,
                alert_type: alert.alert_type,
                mes: mes,
                ano: ano,
                predicted_value: prediction.receita_prevista,
                target_value: target?.target_value,
                variance_percentage: variancePercentage,
                reason: reason,
                confidence: prediction.confianca
              }
            })
          }

          alertsTriggered.push({
            alert_name: alert.alert_name,
            reason: reason,
            notifications: notifications.length,
            mes: `${mes}/${ano}`,
            predicted_value: prediction.receita_prevista,
            variance_percentage: variancePercentage
          })

          // Enviar notificações (simplificado - em produção usar filas)
          for (const notification of notifications) {
            try {
              if (notification.type === 'email') {
                console.log('Email notification would be sent:', notification)
                // Implementar envio de email via função send-cost-alert
              } else if (notification.type === 'whatsapp') {
                console.log('WhatsApp notification would be sent:', notification)
                // Implementar envio via função send-whatsapp-alert
              } else if (notification.type === 'n8n') {
                await fetch(notification.webhook_url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notification.payload)
                })
                console.log('n8n webhook triggered successfully')
              }
            } catch (error) {
              console.error(`Erro ao enviar notificação ${notification.type}:`, error)
            }
          }
        }
      }
    }

    console.log(`Verificação concluída: ${alertsTriggered.length} alertas disparados`)

    return new Response(
      JSON.stringify({
        success: true,
        alerts_checked: alerts.length,
        alerts_triggered: alertsTriggered.length,
        details: alertsTriggered
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro na função check-predictive-alerts:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
