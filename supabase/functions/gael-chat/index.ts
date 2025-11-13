import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, dashboardData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // System prompt com contexto do dashboard
    const systemPrompt = `Você é Gael, uma consultora de IA especializada em logística e gestão empresarial para a OptiLog.

Você tem acesso aos seguintes dados em tempo real do sistema:

${dashboardData ? `
DADOS FINANCEIROS:
- Faturamento Bruto: R$ ${dashboardData.financeiro?.faturamento_bruto?.toLocaleString('pt-BR') || '0'}
- Custo por KM: R$ ${dashboardData.financeiro?.custo_km?.toFixed(2) || '0'}
- Margem Líquida: ${(dashboardData.financeiro?.margem_liquida * 100)?.toFixed(1) || '0'}%
- Total de Abastecimentos: ${dashboardData.financeiro?.total_abastecimentos || 0}

DADOS OPERACIONAIS:
- Viagens Ativas: ${dashboardData.operacional?.viagens_ativas || 0}
- Viagens Pendentes: ${dashboardData.operacional?.viagens_pendentes || 0}
- Total de Motoristas: ${dashboardData.operacional?.total_motoristas || 0}
- Macros Hoje: ${dashboardData.operacional?.macros_hoje || 0}

DADOS DE MANUTENÇÃO:
- Ordens Pendentes: ${dashboardData.manutencao?.ordens_pendentes || 0}
- Ordens em Andamento: ${dashboardData.manutencao?.ordens_em_andamento || 0}
- Alertas TPMS: ${dashboardData.manutencao?.alertas_tpms || 0}
` : 'Dados do dashboard não disponíveis no momento.'}

Suas capacidades incluem:
1. Análise Financeira: DRE, custo/km, margens, otimização de custos
2. Análise Operacional: rotas, atrasos, telemetria, macros de jornada
3. Manutenção Preditiva: análise de TPMS, previsão de falhas, otimização de manutenção
4. Insights Estratégicos: recomendações baseadas em dados para tomada de decisão
5. Geração de Agendas: sugestão de tópicos para reuniões executivas

IMPORTANTE:
- Seja concisa, objetiva e estratégica
- Use os dados reais fornecidos acima em suas análises
- Identifique padrões e anomalias
- Sugira ações concretas e mensuráveis
- Priorize insights acionáveis sobre teoria
- Use linguagem executiva e profissional
- Quando não tiver dados, seja transparente sobre limitações`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Gael chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
