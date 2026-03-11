import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { chatCompletionStream, AIProviderError } from "../_shared/ai-provider.ts";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().max(10000)
  })).max(50),
  dashboardData: z.object({
    financeiro: z.any().optional(),
    operacional: z.any().optional(),
    manutencao: z.any().optional()
  }).optional()
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const { messages, dashboardData } = validated;

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

    const streamResponse = await chatCompletionStream({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 2000,
      stream: true,
    });

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Gael chat error:", e);

    if (e instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: e.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (e instanceof AIProviderError) {
      if (e.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (e.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos/limite insuficientes no serviço de IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
