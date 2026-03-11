import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { chatCompletion, AIProviderError } from "../_shared/ai-provider.ts";

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
      throw new Error("CNPJ do cliente e obrigatorio");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('cnpj', clientCnpj)
      .single();

    if (clientError) throw clientError;

    const { data: ctes, error: ctesError } = await supabase
      .from('cte')
      .select('*')
      .eq('tomador_cnpj', clientCnpj)
      .order('data_emissao', { ascending: false })
      .limit(100);

    if (ctesError) throw ctesError;

    const { data: financialAnalysis, error: analysisError } = await supabase
      .from('client_financial_analysis')
      .select('*')
      .eq('client_cnpj', clientCnpj)
      .order('periodo_ano', { ascending: false })
      .order('periodo_mes', { ascending: false })
      .limit(12);

    if (analysisError) throw analysisError;

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

    const systemPrompt = `Voce e um analista financeiro especializado em logistica e transportes. Analise os dados do cliente e forneca:
1. Analise Preditiva: Previsao de receita para proximos 3 meses
2. Analise Comparativa: Comparacao com medias do setor
3. Analise Fiscal: Oportunidades de economia em impostos
4. Recomendacoes: Acoes especificas para melhorar a relacao comercial

Seja objetivo, especifico e baseado em dados.`;

    const userPrompt = `Analise este cliente de transportes:

Cliente: ${client.razao_social} (${client.cnpj})
Condicao de Pagamento: ${client.condicao_pagamento}
Limite de Credito: R$ ${client.limite_credito}

Dados Financeiros:
- Total de CT-es: ${totalCtes}
- Receita Total: R$ ${totalReceita.toFixed(2)}
- Media Mensal: R$ ${mediaMensal.toFixed(2)}
- Ticket Medio: R$ ${ticketMedio.toFixed(2)}
- CT-es Atrasados: ${ctesAtrasados}
- Status: ${inadimplente ? 'Inadimplente' : 'Adimplente'}
- Score: ${scoreCliente}/100

Historico (ultimos 12 meses):
${financialAnalysis?.map(fa =>
  `${fa.periodo_mes}/${fa.periodo_ano}: R$ ${Number(fa.receita_total).toFixed(2)} (${fa.total_ctes} CT-es)`
).join('\n')}

Forneca analise completa com numeros especificos.`;

    const result = await chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

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
        analysis: result.content,
        provider: result.provider,
        financialHistory: financialAnalysis,
        recentCtes: ctes?.slice(0, 10)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Erro na analise:", error);

    if (error instanceof AIProviderError) {
      if (error.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite de requisicoes excedido. Tente novamente em alguns instantes." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (error.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Creditos/limite insuficientes no servico de IA." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
    }

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
