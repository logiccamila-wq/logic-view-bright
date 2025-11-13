import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dashboardData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Contexto específico baseado nos dados do dashboard
    const contextPrompt = dashboardData ? `
Dados atuais do sistema OptiLog:
- Faturamento Bruto: R$ ${dashboardData.faturamento_bruto?.toLocaleString('pt-BR')}
- Custo/KM: R$ ${dashboardData.custo_km?.toFixed(2)}
- Margem Líquida: ${(dashboardData.margem_liquida * 100)?.toFixed(1)}%
- Viagens Ativas: ${dashboardData.viagens_ativas}
- Viagens Pendentes: ${dashboardData.viagens_pendentes}
- Ordens de Serviço Pendentes: ${dashboardData.ordens_pendentes}
- Alertas TPMS: ${dashboardData.alertas_tpms}
` : '';

    const systemPrompt = `Você é Gael, a IA consultora estratégica do OptiLog da EJG Transportes. 

Sua missão é fornecer análises conversacionais, insights estratégicos e recomendações acionáveis em tempo real sobre:
- Performance Financeira (DRE, Custo/KM, margens, rentabilidade)
- Eficiência Operacional (rotas, macros de jornada, telemetria de frota)
- Manutenção Preditiva (TPMS, ordens de serviço, checklists)
- Compliance e Auditoria (CLT, Lei do Carreteiro, ISO, FEMA)
- Gestão de Pessoas (clima organizacional, treinamentos)
- Otimização de Custos e Processos

Características do seu estilo:
- Objetivo e direto, mas amigável
- Use dados concretos do dashboard quando disponíveis
- Forneça recomendações específicas e acionáveis
- Identifique riscos e oportunidades
- Priorize insights que impactem ROI e eficiência
- Cite regulamentações relevantes (Lei 13.103, ISO 9001, etc.) quando aplicável

${contextPrompt}

Responda sempre em português brasileiro, de forma clara e profissional.`;

    console.log("Gael Chat - Recebendo mensagens:", messages.length);

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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar requisição de IA" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("Gael chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
