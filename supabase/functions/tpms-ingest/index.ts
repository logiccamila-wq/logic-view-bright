import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorrelationId, logFunction } from "../_shared/correlation.ts";

const getCors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin || "",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tpms-key",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
});

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCors(origin) });
  }

  try {
    const API_KEY = Deno.env.get("TPMS_INGEST_KEY") || "";
    const provided = req.headers.get("x-tpms-key") || "";
    if (!API_KEY || provided !== API_KEY) {
      const cid = getCorrelationId(req);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...getCors(origin), "Content-Type": "application/json", "x-correlation-id": cid } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const {
      vehicle_plate,
      tire_position,
      pressure_psi,
      temperature_celsius,
      tread_depth_mm,
      latitude,
      longitude,
      timestamp,
    } = body;

    const cid = getCorrelationId(req);
    await supabase.from("tpms_readings").insert({
      vehicle_plate,
      tire_position,
      pressure_psi,
      temperature_celsius,
      tread_depth_mm,
      recorded_by: null,
      notes: null,
      created_at: timestamp ?? new Date().toISOString(),
      alert_level: "info",
    } as any);

    await supabase.from("tire_events" as any).insert({
      pneu_id: null,
      event_type: "sensor",
      vehicle_plate,
      position: tire_position,
      pressure_psi,
      temperature_celsius,
      tread_depth_mm,
      latitude,
      longitude,
      timestamp: timestamp ?? new Date().toISOString(),
    } as any);
    await logFunction(supabase, cid, "tpms-ingest", "info", "sensor reading ingested", { vehicle_plate, tire_position });
    return new Response(JSON.stringify({ success: true }), { headers: { ...getCors(origin), "Content-Type": "application/json", "x-correlation-id": cid } });
  } catch (e) {
    console.error(e);
    const cid = getCorrelationId(req);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...getCors(origin), "Content-Type": "application/json", "x-correlation-id": cid } });
  }
});
