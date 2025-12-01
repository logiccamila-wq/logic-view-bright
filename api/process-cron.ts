import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  const now = new Date().toISOString();
  const { data: overdue } = await supabase
    .from("process_actions")
    .select("id,title,module,due_date,status")
    .lt("due_date", now)
    .neq("status", "completed")
    .limit(200);
  const { data: critical } = await supabase
    .from("non_conformities")
    .select("id,description,module,vehicle_plate,rpn,status")
    .gte("rpn", 200)
    .eq("status", "open")
    .limit(200);

  res.status(200).json({ success: true, overdue: (overdue || []).length, critical: (critical || []).length });
}
