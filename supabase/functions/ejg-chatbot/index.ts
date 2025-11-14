import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { messages, conversationId, userId } = await req.json();
    
    console.log(`Processing chat request for conversation ${conversationId}`);

    // Get user context
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    // Get user roles for context
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = roles?.map(r => r.role).join(", ") || "user";

    // Get conversation context
    const { data: conversation } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    const systemPrompt = `Você é EJG Assistant, um assistente virtual da EJG Evolução em Transporte, 
especializado em logística e transporte. Você está conversando com ${profile?.full_name || "um usuário"} 
que tem as permissões: ${userRoles}.

CONTEXTO DA CONVERSA:
- Tipo: ${conversation?.type === 'support' ? 'Suporte Técnico' : conversation?.type === 'internal' ? 'Comunicação Interna' : 'Ajuda do Sistema'}
- Assunto: ${conversation?.subject}

SUAS RESPONSABILIDADES:

1. SUPORTE TÉCNICO (type: support):
   - Resolver problemas técnicos do sistema
   - Abrir e gerenciar tickets de suporte
   - Fornecer soluções práticas e imediatas
   
2. COMUNICAÇÃO INTERNA (type: internal):
   - Facilitar comunicação entre motoristas, mecânicos e gestores
   - Transmitir mensagens importantes
   - Conectar pessoas quando necessário

3. AJUDA DO SISTEMA (type: help):
   - Explicar funcionalidades do sistema
   - Guiar usuários em processos
   - Responder dúvidas sobre:
     * Lei 13.103/2015 (jornada de motoristas)
     * Cálculo de gratificações (Valor CTe - 17% - Combustível) × 3%
     * Folha de pagamento
     * Manutenção de veículos
     * Gestão de frota

REGRAS:
- Seja objetivo e profissional
- Use linguagem clara e acessível
- Se não souber algo, seja honesto e ofereça alternativas
- Para tickets de suporte, sempre pergunte detalhes do problema
- Para comunicação interna, mantenha tom respeitoso
- Cite números de ticket quando relevante

IMPORTANTE: Você tem acesso ao FAQ do sistema e pode consultar informações específicas quando necessário.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

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
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua mensagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Save AI response to database
    await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        message: aiMessage,
        message_type: "text",
        metadata: { model: "google/gemini-2.5-flash" },
      });

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ejg-chatbot:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});