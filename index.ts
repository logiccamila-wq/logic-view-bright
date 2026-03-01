// index.ts (Edge Function)
Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // trocar para seu domínio em produção
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      const payload = { message: 'Quick endpoint OK', method: 'GET', timestamp: Date.now() };
      return new Response(JSON.stringify(payload), { status: 200, headers: corsHeaders });
    } else if (req.method === 'POST') {
      const body = await req.text();
      let parsed;
      try {
        parsed = body ? JSON.parse(body) : null;
      } catch (e) {
        parsed = { raw: body };
      }
      const payload = { message: 'Quick endpoint OK', method: 'POST', body: parsed, timestamp: Date.now() };
      return new Response(JSON.stringify(payload), { status: 200, headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(err) }), { status: 500, headers: corsHeaders });
  }
});
