export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const payloadText = await request.text();
  const data = payloadText || '{}';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  const hashArray = Array.from(new Uint8Array(digest));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return new Response(JSON.stringify({ hash: hashHex, data: JSON.parse(data) }), { status: 200 });
};
