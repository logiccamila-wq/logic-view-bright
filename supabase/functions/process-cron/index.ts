import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { logFunction } from "../_shared/correlation.ts";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date().toISOString();

  const { data: overdue } = await supabase
    .from("process_actions")
    .select("id,title,module,due_date,status")
    .lt("due_date", now)
    .neq("status", "completed")
    .limit(200);

  for (const a of overdue || []) {
    await supabase.rpc("notify_roles", {
      title: "Ação atrasada",
      message: a.title,
      type: "warning",
      module: a.module,
      role_name: "operations",
    } as any);
  }

  const { data: critical } = await supabase
    .from("non_conformities")
    .select("id,description,module,vehicle_plate,rpn,status")
    .gte("rpn", 200)
    .eq("status", "open")
    .limit(200);

  for (const nc of critical || []) {
    await supabase.rpc("notify_roles", {
      title: "NC crítica",
      message: `RPN ${nc.rpn} em ${nc.vehicle_plate || ''} - ${nc.description}`,
      type: "error",
      module: nc.module,
      role_name: "maintenance_manager",
    } as any);
  }
  await logFunction(supabase, crypto.randomUUID(), "process-cron", "info", "cron processed", { overdue: (overdue || []).length, critical: (critical || []).length });
  return new Response(JSON.stringify({ success: true, overdue: (overdue || []).length, critical: (critical || []).length }), { headers: { "Content-Type": "application/json" } });
});
