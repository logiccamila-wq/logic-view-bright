import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_ORIGINS = [
  'https://xyzlogicflow.pages.dev',
  'https://www.xyzlogicflow.tech',
  'https://logic-view-bright.vercel.app'
]

function corsOrigin(origin?: string) {
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin))
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin))
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: 'Missing env' })

  const { client_key, module_key } = (req.body as any) || {}
  if (!client_key || !module_key) return res.status(400).json({ error: 'client_key and module_key required' })

  const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/client_modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Prefer: 'return=representation' },
    body: JSON.stringify({ client_key, module_key, status: 'installed', installed_at: new Date().toISOString() })
  })
  const txt = await resp.text()
  let js: any
  try { js = txt ? JSON.parse(txt) : null } catch { js = txt }
  if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to install module', details: js })

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin))
  return res.status(200).json({ success: true })
}

