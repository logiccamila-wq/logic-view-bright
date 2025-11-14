import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppAlertRequest {
  alertType: string;
  vehiclePlate?: string;
  currentValue: number;
  threshold?: number;
  trendPercentage?: number;
  period: string;
  phoneNumbers: string[];
  whatsappApiKey?: string;
  whatsappApiUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const {
      alertType,
      vehiclePlate,
      currentValue,
      threshold,
      trendPercentage,
      period,
      phoneNumbers,
      whatsappApiKey,
      whatsappApiUrl,
    }: WhatsAppAlertRequest = await req.json();

    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error("No phone numbers provided");
    }

    // Get WhatsApp configuration from integration_settings
    let apiKey = whatsappApiKey;
    let apiUrl = whatsappApiUrl;

    if (!apiKey || !apiUrl) {
      const { data: integration } = await supabaseClient
        .from("integration_settings")
        .select("config")
        .eq("user_id", user.id)
        .eq("integration_type", "whatsapp")
        .eq("is_active", true)
        .single();

      if (integration?.config) {
        apiKey = integration.config.apiKey;
        apiUrl = integration.config.apiUrl || "https://graph.facebook.com/v18.0";
      }
    }

    if (!apiKey) {
      throw new Error("WhatsApp API key not configured");
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    // Build message based on alert type
    let message = "";

    if (alertType === "cost_threshold") {
      message = `🚨 *ALERTA: Limite de Custo Ultrapassado*\n\n`;
      if (vehiclePlate) message += `🚗 *Veículo:* ${vehiclePlate}\n`;
      message += `📅 *Período:* ${period}\n`;
      message += `💰 *Limite:* ${formatCurrency(threshold || 0)}\n`;
      message += `💸 *Custo Atual:* ${formatCurrency(currentValue)}\n\n`;
      message += `⚠️ O custo ultrapassou o limite em ${formatCurrency(currentValue - (threshold || 0))} (${(((currentValue - (threshold || 0)) / (threshold || 1)) * 100).toFixed(1)}%)\n\n`;
      message += `É recomendado revisar os custos de manutenção.`;
    } else if (alertType === "trend_increase") {
      message = `📈 *ALERTA: Tendência Crítica*\n\n`;
      if (vehiclePlate) message += `🚗 *Veículo:* ${vehiclePlate}\n`;
      message += `📊 *Período:* ${period}\n`;
      message += `📈 *Aumento:* +${trendPercentage?.toFixed(1)}%\n`;
      message += `💰 *Custo Médio:* ${formatCurrency(currentValue)}\n\n`;
      message += `⚠️ Tendência de aumento significativo detectada\n\n`;
      message += `*Recomendações:*\n`;
      message += `• Revisar histórico de manutenções\n`;
      message += `• Verificar problemas recorrentes\n`;
      message += `• Avaliar manutenção preventiva`;
    } else if (alertType === "vehicle_specific") {
      message = `🚗 *ALERTA: Veículo com Custos Elevados*\n\n`;
      message += `🚗 *Veículo:* ${vehiclePlate}\n`;
      message += `📅 *Período:* ${period}\n`;
      message += `💰 *Custo Total:* ${formatCurrency(currentValue)}\n\n`;
      message += `ℹ️ Este veículo apresentou custos acima do esperado\n\n`;
      message += `*Ações Sugeridas:*\n`;
      message += `• Avaliar histórico de manutenções\n`;
      message += `• Verificar problemas crônicos\n`;
      message += `• Analisar viabilidade econômica`;
    }

    message += `\n\n_Sistema de Gestão de Frota - EJG Transportes_`;

    // Send WhatsApp messages
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        // Format phone number (remove special characters)
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        
        // WhatsApp Business API endpoint
        const endpoint = `${apiUrl}/${Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "YOUR_PHONE_NUMBER_ID"}/messages`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: {
              preview_url: false,
              body: message,
            },
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          results.push({ phone: phoneNumber, success: true, messageId: result.messages?.[0]?.id });
          console.log(`WhatsApp message sent to ${phoneNumber}`);
        } else {
          results.push({ phone: phoneNumber, success: false, error: result.error?.message || "Unknown error" });
          console.error(`Failed to send WhatsApp to ${phoneNumber}:`, result);
        }
      } catch (error: any) {
        results.push({ phone: phoneNumber, success: false, error: error.message });
        console.error(`Error sending WhatsApp to ${phoneNumber}:`, error);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        results,
        message: `WhatsApp alert sent to ${successCount} recipient(s)`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
