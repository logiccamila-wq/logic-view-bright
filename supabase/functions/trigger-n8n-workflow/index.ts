import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface N8nWorkflowRequest {
  webhookUrl: string;
  alertData: {
    alertType: string;
    vehiclePlate?: string;
    currentValue: number;
    threshold?: number;
    trendPercentage?: number;
    period: string;
    alertName?: string;
    timestamp: string;
  };
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

    const { webhookUrl, alertData }: N8nWorkflowRequest = await req.json();

    if (!webhookUrl) {
      throw new Error("Webhook URL is required");
    }

    console.log("Triggering n8n workflow:", webhookUrl);

    // Prepare payload for n8n
    const payload = {
      source: "ejg_fleet_management",
      module: "maintenance_cost_alerts",
      user_id: user.id,
      timestamp: alertData.timestamp || new Date().toISOString(),
      alert: {
        type: alertData.alertType,
        name: alertData.alertName,
        vehicle_plate: alertData.vehiclePlate,
        current_value: alertData.currentValue,
        threshold: alertData.threshold,
        trend_percentage: alertData.trendPercentage,
        period: alertData.period,
        formatted_value: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(alertData.currentValue),
      },
      metadata: {
        environment: Deno.env.get("ENVIRONMENT") || "production",
        app_version: "1.0.0",
      },
    };

    // Trigger n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error("n8n webhook error:", response.status, responseData);
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    console.log("n8n workflow triggered successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "n8n workflow triggered successfully",
        workflow_response: responseData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in trigger-n8n-workflow function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to trigger n8n workflow. Please check your webhook URL and n8n configuration."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
