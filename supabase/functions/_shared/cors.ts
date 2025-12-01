export function getAllowedOrigins() {
  const raw = (Deno.env.get("ALLOWED_ORIGINS") || "").trim();
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  const isAllowed = origin && (allowed.length === 0 || allowed.includes(origin));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  };
}

export function handlePreflight(origin: string | null) {
  return new Response(null, { headers: buildCorsHeaders(origin) });
}

