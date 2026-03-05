import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientCnpj } = await req.json();
    
    if (!clientCnpj) {
      throw new Error("CNPJ do cliente é obrigatório");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('cnpj', clientCnpj)
      .single();

    if (clientError) throw clientError;

    // Buscar CTEs do cliente
    const { data: ctes, error: ctesError } = await supabase
      .from('cte')
      .select('*')
      .eq('tomador_cnpj', clientCnpj)
      .order('data_emissao', { ascending: false })
      .limit(100);

    if (ctesError) throw ctesError;

    // Buscar análise financeira
    const { data: financialAnalysis, error: analysisError } = await supabase
      .from('client_financial_analysis')
      .select('*')
      .eq('client_cnpj', clientCnpj)
      .order('periodo_ano', { ascending: false })
      .order('periodo_mes', { ascending: false })
      .limit(12);

    if (analysisError) throw analysisError;

    // Preparar dados para análise
    const totalCtes = ctes?.length || 0;
    const totalReceita = ctes?.reduce((sum, cte) => sum + Number(cte.valor_total), 0) || 0;
    const mediaMensal = financialAnalysis?.reduce((sum, fa) => sum + Number(fa.receita_total), 0) / (financialAnalysis?.length || 1) || 0;
    const ticketMedio = totalCtes > 0 ? totalReceita / totalCtes : 0;
    
    const ctesAtrasados = ctes?.filter(cte => 
      cte.status_pagamento === 'pendente' && 
      cte.data_vencimento && 
      new Date(cte.data_vencimento) < new Date()
    ).length || 0;

    const inadimplente = financialAnalysis?.[0]?.inadimplente || false;
    const scoreCliente = financialAnalysis?.[0]?.score_cliente || 100;

    // Chamar Lovable AI para análise
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    const systemPrompt = `Você é um analista financeiro especializado em logística e transportes. Analise os dados do cliente e forneça:
1. Análise Preditiva: Previsão de receita para próximos 3 meses
2. Análise Comparativa: Comparação com médias do setor
3. Análise Fiscal: Oportunidades de economia em impostos
4. Recomendações: Ações específicas para melhorar a relação comercial

Seja objetivo, específico e baseado em dados.`;

    const userPrompt = `Analise este cliente de transportes:

Cliente: ${client.razao_social} (${client.cnpj})
Condição de Pagamento: ${client.condicao_pagamento}
Limite de Crédito: R$ ${client.limite_credito}

Dados Financeiros:
- Total de CT-es: ${totalCtes}
- Receita Total: R$ ${totalReceita.toFixed(2)}
- Média Mensal: R$ ${mediaMensal.toFixed(2)}
- Ticket Médio: R$ ${ticketMedio.toFixed(2)}
- CT-es Atrasados: ${ctesAtrasados}
- Status: ${inadimplente ? 'Inadimplente' : 'Adimplente'}
- Score: ${scoreCliente}/100

Histórico (últimos 12 meses):
${financialAnalysis?.map(fa => 
  `${fa.periodo_mes}/${fa.periodo_ano}: R$ ${Number(fa.receita_total).toFixed(2)} (${fa.total_ctes} CT-es)`
).join('\n')}

Forneça análise completa com números específicos.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error("Limite de requisições excedido. Tente novamente em alguns instantes.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Créditos insuficientes. Adicione créditos ao seu workspace.");
      }
      const errorText = await aiResponse.text();
      console.error("Erro na API de IA:", aiResponse.status, errorText);
      throw new Error("Erro ao gerar análise com IA");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        client,
        metrics: {
          totalCtes,
          totalReceita,
          mediaMensal,
          ticketMedio,
          ctesAtrasados,
          inadimplente,
          scoreCliente
        },
        analysis,
        financialHistory: financialAnalysis,
        recentCtes: ctes?.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Erro na análise:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido ao analisar cliente"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
