import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RevenueData {
  mes: string;
  ano: number;
  receita: number;
  custos: number;
  total_ctes: number;
  peso_total: number;
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

    const { months_ahead = 3 } = await req.json()

    console.log(`Gerando previsão para os próximos ${months_ahead} meses...`)

    // Buscar dados históricos dos últimos 24 meses da tabela cte
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 24)

    const { data: revenues, error: revenueError } = await supabaseClient
      .from('cte')
      .select('data_emissao, valor_total, valor_frete, peso_bruto, status')
      .gte('data_emissao', startDate.toISOString())
      .in('status', ['autorizado', 'emitido'])
      .order('data_emissao', { ascending: true })

    if (revenueError) throw revenueError

    console.log(`Encontrados ${revenues?.length || 0} CT-es no período`)

    // Processar dados históricos por mês
    const monthlyData: Map<string, RevenueData> = new Map()
    
    revenues?.forEach((rev: any) => {
      const date = new Date(rev.data_emissao)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existing = monthlyData.get(key) || {
        mes: String(date.getMonth() + 1),
        ano: date.getFullYear(),
        receita: 0,
        custos: 0,
        total_ctes: 0,
        peso_total: 0
      }
      
      existing.receita += parseFloat(rev.valor_total || 0)
      existing.custos += parseFloat(rev.valor_total || 0) * 0.7 // Estimativa de custo
      existing.total_ctes += 1
      existing.peso_total += parseFloat(rev.peso_bruto || 0)
      
      monthlyData.set(key, existing)
    })

    const historicalData = Array.from(monthlyData.values())
    
    if (historicalData.length < 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados insuficientes para previsão. São necessários pelo menos 3 meses de histórico.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Preparar contexto para a IA
    const dataContext = {
      historical_data: historicalData,
      statistics: {
        avg_monthly_revenue: historicalData.reduce((sum, d) => sum + d.receita, 0) / historicalData.length,
        avg_monthly_ctes: historicalData.reduce((sum, d) => sum + d.total_ctes, 0) / historicalData.length,
        avg_ticket: historicalData.reduce((sum, d) => sum + d.receita, 0) / 
                    historicalData.reduce((sum, d) => sum + d.total_ctes, 0),
        total_months: historicalData.length
      }
    }

    // Chamar Lovable AI para análise preditiva
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada')
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise preditiva financeira e previsão de receita. 
Analise os dados históricos fornecidos e gere previsões precisas considerando:
- Tendências de crescimento ou declínio
- Sazonalidade (variações por mês do ano)
- Padrões recorrentes
- Anomalias nos dados

Retorne APENAS um JSON válido no formato:
{
  "predictions": [
    {
      "mes": "2025-12",
      "receita_prevista": 150000,
      "receita_min": 140000,
      "receita_max": 160000,
      "confianca": 85,
      "fatores": ["tendência de crescimento", "alta sazonalidade de fim de ano"]
    }
  ],
  "insights": {
    "tendencia_geral": "crescimento",
    "taxa_crescimento_mensal": 5.2,
    "sazonalidade": {
      "meses_altos": [11, 12],
      "meses_baixos": [1, 2]
    },
    "confiabilidade": "alta",
    "recomendacoes": ["aumentar capacidade para dezembro", "preparar estoque"]
  }
}`
          },
          {
            role: 'user',
            content: `Analise estes dados históricos de receita e gere previsões para os próximos ${months_ahead} meses:

Dados Históricos (últimos ${dataContext.statistics.total_months} meses):
${JSON.stringify(dataContext, null, 2)}

Estatísticas:
- Receita média mensal: R$ ${dataContext.statistics.avg_monthly_revenue.toFixed(2)}
- Média de CT-es por mês: ${dataContext.statistics.avg_monthly_ctes.toFixed(0)}
- Ticket médio: R$ ${dataContext.statistics.avg_ticket.toFixed(2)}

Gere previsões realistas considerando os padrões históricos e sazonalidade.`
          }
        ],
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao seu workspace Lovable.' }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      const errorText = await aiResponse.text()
      console.error('Erro na API Lovable AI:', aiResponse.status, errorText)
      throw new Error('Erro ao gerar previsão')
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices[0].message.content

    // Extrair JSON da resposta
    let predictions
    try {
      // Tentar extrair JSON se estiver envolvido em markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      predictions = JSON.parse(jsonString)
    } catch (e) {
      console.error('Erro ao parsear resposta da IA:', e, 'Content:', content)
      // Fallback: gerar previsões simples baseadas na média
      const avgRevenue = dataContext.statistics.avg_monthly_revenue
      const growthRate = 1.03 // 3% de crescimento
      predictions = {
        predictions: Array.from({ length: months_ahead }, (_, i) => {
          const futureRevenue = avgRevenue * Math.pow(growthRate, i + 1)
          return {
            mes: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
            receita_prevista: futureRevenue,
            receita_min: futureRevenue * 0.9,
            receita_max: futureRevenue * 1.1,
            confianca: 70,
            fatores: ['baseado em média histórica']
          }
        }),
        insights: {
          tendencia_geral: 'estável',
          taxa_crescimento_mensal: 3,
          sazonalidade: { meses_altos: [11, 12], meses_baixos: [1, 2] },
          confiabilidade: 'média',
          recomendacoes: ['monitorar tendências mensais']
        }
      }
    }

    console.log('Previsão gerada com sucesso')

    return new Response(
      JSON.stringify({
        success: true,
        historical_data: historicalData,
        predictions: predictions.predictions,
        insights: predictions.insights,
        metadata: {
          generated_at: new Date().toISOString(),
          months_analyzed: historicalData.length,
          months_predicted: months_ahead
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro na função predict-revenue:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
