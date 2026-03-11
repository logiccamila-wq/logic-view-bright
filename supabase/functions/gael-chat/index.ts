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
  }).optional(),
  optimization: z.number().min(0).max(100).optional().default(50),
  risk: z.number().min(0).max(100).optional().default(50),
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
    const { messages, dashboardData, optimization, risk } = validated;

    // Derive slider-driven strategy labels
    const optLevel = optimization >= 75 ? "alta" : optimization >= 40 ? "moderada" : "baixa";
    const riskLevel = risk >= 75 ? "alto" : risk >= 40 ? "moderado" : "baixo";

    const optStrategy = optimization >= 75
      ? "Adote uma visão agressiva de crescimento: priorize expansão, aumento de faturamento, novos mercados e recomendações ousadas de investimento."
      : optimization >= 40
        ? "Adote uma visão equilibrada: sugira melhorias graduais, otimização de processos e eficiência operacional sem riscos excessivos."
        : "Adote uma visão conservadora: priorize redução de custos, eficiência máxima, cortes inteligentes e preservação de caixa.";

    const riskStrategy = risk >= 75
      ? "O usuário aceita alto risco: recomende expansão agressiva, aumento de estoque estratégico, projeções ousadas e investimentos com retorno potencialmente alto."
      : risk >= 40
        ? "O usuário aceita risco moderado: sugira ações com risco calculado, projeções equilibradas e crescimento sustentável."
        : "O usuário prefere baixo risco: recomende ações conservadoras, proteção de caixa, baixa alavancagem e foco em estabilidade.";

    // System prompt com contexto do dashboard e sliders
    const systemPrompt = `Você é o núcleo de inteligência do ERP Vision Pilot (Gael), uma consultora de IA especializada em logística e gestão empresarial para a OptiLog.

Diretrizes principais:

1. IDENTIDADE
- Responda com tom profissional, futurista, técnico e objetivo.
- Use linguagem compatível com uma interface high-tech dark mode.
- Termos sugeridos: "renderizando análise", "processando shaders de dados", "parâmetros sincronizados", "simulação concluída".

2. FORMATO DE RESPOSTA
- Sempre que possível, responda em JSON estruturado.
- Estrutura preferencial:
{
  "message": "texto principal",
  "widgets": [
    { "type": "kpi", "title": "...", "value": "..." },
    { "type": "insight", "title": "...", "content": "..." },
    { "type": "table", "title": "...", "columns": [], "rows": [] },
    { "type": "chart", "title": "...", "chartType": "bar", "data": [] }
  ],
  "suggested_actions": ["...", "..."]
}

3. PARÂMETROS DE SLIDER (CONTEXTO OBRIGATÓRIO)
O usuário ajustou os seguintes parâmetros no frontend:
- Otimização: ${optimization}% (nível: ${optLevel})
- Risco: ${risk}% (nível: ${riskLevel})

ESTRATÉGIA DE OTIMIZAÇÃO: ${optStrategy}

ESTRATÉGIA DE RISCO: ${riskStrategy}

Suas recomendações DEVEM refletir esses parâmetros. Sugira ao usuário ajustar os sliders quando apropriado.
Exemplo: "Ajuste o slider de Otimização para 72% para simular maior margem com pressão logística moderada."

4. CONTEXTO ERP
Priorize respostas relacionadas a: faturamento, estoque, margem, fluxo de caixa, previsão, risco operacional, clientes, compras e vendas.

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

5. TOM
- Ultra-rápido
- Claro
- Executivo
- Sem exageros literários
- Foco em ação e análise

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
