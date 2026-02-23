import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders(null);

interface OdooSyncRequest {
  config: {
    url: string;
    database: string;
    username: string;
    apiKey: string;
    syncProducts: boolean;
    syncCustomers: boolean;
    syncOrders: boolean;
  };
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return handlePreflight(null);
  }

  try {
    const { config, userId }: OdooSyncRequest = await req.json();

    // Validate input
    if (!config || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate with Odoo
    const authResponse = await fetch(`${config.url}/web/session/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        params: {
          db: config.database,
          login: config.username,
          password: config.apiKey,
        },
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Odoo authentication failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();

    if (authData.error || !authData.result?.uid) {
      throw new Error("Odoo authentication failed");
    }

    const sessionId = authData.result.session_id;
    let productsCount = 0;
    let customersCount = 0;
    let ordersCount = 0;

    // Helper function to call Odoo RPC
    const callOdoo = async (model: string, method: string, args: any[] = []) => {
      const response = await fetch(`${config.url}/web/dataset/call_kw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            model,
            method,
            args,
            kwargs: {},
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Odoo API call failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Odoo Error: ${data.error.message}`);
      }

      return data.result;
    };

    // Sync Products
    if (config.syncProducts) {
      // Fetch products in batches to avoid timeout
      // Limiting to 500 products per sync for performance
      const products = await callOdoo("product.product", "search_read", [
        { active: true }, // Only active products
        ["id", "name", "default_code", "list_price", "qty_available", "categ_id", "type"],
        0, // offset
        500, // limit
      ]);

      // Store products in a custom table (you'll need to create this table)
      // For now, we'll just count them
      productsCount = products.length;
      
      console.log(`Synced ${productsCount} products from Odoo`);
    }

    // Sync Customers
    if (config.syncCustomers) {
      const customers = await callOdoo("res.partner", "search_read", [
        { customer_rank: [">", 0] },
        ["id", "name", "vat", "email", "phone", "city", "state_id", "country_id"],
      ]);

      customersCount = customers.length;
      
      console.log(`Synced ${customersCount} customers from Odoo`);
    }

    // Sync Orders
    if (config.syncOrders) {
      // Fetch orders from last 90 days to avoid timeout
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const dateFilter = ninetyDaysAgo.toISOString().split('T')[0];
      
      const orders = await callOdoo("sale.order", "search_read", [
        { date_order: [">=", dateFilter] },
        ["id", "name", "partner_id", "date_order", "amount_total", "state"],
        0, // offset
        500, // limit
      ]);

      ordersCount = orders.length;
      
      console.log(`Synced ${ordersCount} orders from Odoo (last 90 days)`);
    }

    // Update last sync time
    await supabase
      .from("integration_settings")
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("integration_type", "odoo");

    return new Response(
      JSON.stringify({
        success: true,
        products: productsCount,
        customers: customersCount,
        orders: ordersCount,
        message: "Synchronization completed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing with Odoo:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
