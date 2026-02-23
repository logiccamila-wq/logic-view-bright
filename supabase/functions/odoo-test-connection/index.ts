import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders(null);

interface OdooTestRequest {
  url: string;
  database: string;
  username: string;
  apiKey: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handlePreflight(null);
  }

  try {
    const { url, database, username, apiKey }: OdooTestRequest = await req.json();

    // Validate input
    if (!url || !database || !username || !apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: url, database, username, or apiKey",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate with Odoo
    const authResponse = await fetch(`${url}/web/session/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        params: {
          db: database,
          login: username,
          password: apiKey,
        },
      }),
    });

    if (!authResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Odoo server returned ${authResponse.status}: ${authResponse.statusText}`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authData = await authResponse.json();

    if (authData.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authData.error.data?.message || authData.error.message || "Authentication failed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!authData.result || !authData.result.uid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication failed: No user ID received from Odoo",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        success: true,
        uid: authData.result.uid,
        username: authData.result.name || username,
        company_id: authData.result.company_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error testing Odoo connection:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
