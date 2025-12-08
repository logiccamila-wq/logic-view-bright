export const onRequest: PagesFunction = async ({ request, env }) => {
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  const apiKey = (env as any).RESEND_API_KEY || "";
  if (!apiKey) return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), { status: 500 });
  let payload: any = {};
  try { payload = await request.json(); } catch {}
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const txt = await r.text();
  let data: any = null;
  try { data = JSON.parse(txt); } catch { data = { raw: txt }; }
  return new Response(JSON.stringify(data), { status: r.ok ? 200 : r.status });
};

