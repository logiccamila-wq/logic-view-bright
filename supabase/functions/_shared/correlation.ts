export function getCorrelationId(req: Request): string {
  const existing = req.headers.get("x-correlation-id");
  if (existing && existing.length > 0) return existing;
  const r = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(r).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function logFunction(supabase: any, correlationId: string, functionName: string, level: string, message: string, metadata?: Record<string, unknown>) {
  try {
    await supabase.from("function_logs").insert({ correlation_id: correlationId, function_name: functionName, level, message, metadata });
  } catch (_) {}
}

