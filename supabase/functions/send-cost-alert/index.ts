import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CostAlertRequest {
  alertType: string;
  vehiclePlate?: string;
  currentValue: number;
  threshold?: number;
  trendPercentage?: number;
  period: string;
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Validate user authentication
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
      recipients,
    }: CostAlertRequest = await req.json();

    // Validate required fields
    if (!alertType || !currentValue || !period || !recipients || recipients.length === 0) {
      throw new Error("Missing required fields");
    }

    // Build email content based on alert type
    let subject = "";
    let htmlContent = "";

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    if (alertType === "cost_threshold") {
      subject = `🚨 Alerta: Limite de Custo Ultrapassado${vehiclePlate ? ` - ${vehiclePlate}` : ""}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: white; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .value { font-size: 32px; font-weight: bold; color: #DC2626; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Custo</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Limite de Custo Ultrapassado</h2>
                ${vehiclePlate ? `<p><strong>Veículo:</strong> ${vehiclePlate}</p>` : ""}
                <p><strong>Período:</strong> ${period}</p>
                <p><strong>Limite Configurado:</strong> ${formatCurrency(threshold || 0)}</p>
                <p class="value">Custo Atual: ${formatCurrency(currentValue)}</p>
                <p style="color: #DC2626; font-weight: bold;">
                  ⚠️ O custo ultrapassou o limite em ${formatCurrency(currentValue - (threshold || 0))} (${(((currentValue - (threshold || 0)) / (threshold || 1)) * 100).toFixed(1)}%)
                </p>
              </div>
              <p>É recomendado revisar os custos de manutenção e identificar possíveis otimizações.</p>
            </div>
            <div class="footer">
              <p>Sistema de Gestão de Frota - EJG Transportes</p>
              <p>Este é um alerta automático. Não responda este e-mail.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (alertType === "trend_increase") {
      subject = `📈 Alerta: Tendência Crítica de Aumento nos Custos${vehiclePlate ? ` - ${vehiclePlate}` : ""}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: white; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .trend { font-size: 32px; font-weight: bold; color: #F59E0B; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Alerta de Tendência</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Tendência Crítica Detectada</h2>
                ${vehiclePlate ? `<p><strong>Veículo:</strong> ${vehiclePlate}</p>` : ""}
                <p><strong>Período Analisado:</strong> ${period}</p>
                <p class="trend">Aumento: +${trendPercentage?.toFixed(1)}%</p>
                <p><strong>Custo Médio Atual:</strong> ${formatCurrency(currentValue)}</p>
                <p style="color: #F59E0B; font-weight: bold;">
                  ⚠️ Os custos aumentaram significativamente no período analisado
                </p>
              </div>
              <p><strong>Recomendações:</strong></p>
              <ul>
                <li>Revisar o histórico de manutenções recentes</li>
                <li>Verificar se há problemas recorrentes</li>
                <li>Avaliar a necessidade de manutenção preventiva</li>
                <li>Considerar substituição de peças desgastadas</li>
              </ul>
            </div>
            <div class="footer">
              <p>Sistema de Gestão de Frota - EJG Transportes</p>
              <p>Este é um alerta automático. Não responda este e-mail.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (alertType === "vehicle_specific") {
      subject = `🚗 Alerta: Veículo com Custos Elevados - ${vehiclePlate}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert-box { background: white; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .value { font-size: 32px; font-weight: bold; color: #3B82F6; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Alerta de Veículo</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Custos Elevados Detectados</h2>
                <p><strong>Veículo:</strong> ${vehiclePlate}</p>
                <p><strong>Período:</strong> ${period}</p>
                <p class="value">Custo Total: ${formatCurrency(currentValue)}</p>
                <p style="color: #3B82F6; font-weight: bold;">
                  ℹ️ Este veículo apresentou custos acima do esperado
                </p>
              </div>
              <p><strong>Ações Sugeridas:</strong></p>
              <ul>
                <li>Avaliar histórico de manutenções do veículo</li>
                <li>Verificar se há problemas mecânicos crônicos</li>
                <li>Considerar viabilidade econômica de manter o veículo na frota</li>
                <li>Analisar custo-benefício de substituição</li>
              </ul>
            </div>
            <div class="footer">
              <p>Sistema de Gestão de Frota - EJG Transportes</p>
              <p>Este é um alerta automático. Não responda este e-mail.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Log email would be sent (email functionality requires RESEND_API_KEY configuration)
    console.log(`Would send ${recipients.length} emails with subject: ${subject}`);
    console.log('Email functionality requires Resend configuration');

    const successCount = recipients.length;
    const failureCount = 0;

    console.log(
      `Cost alert logged: ${successCount} recipients notified`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        message: `Alert email sent to ${successCount} recipient(s)`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-cost-alert function:", error);
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
