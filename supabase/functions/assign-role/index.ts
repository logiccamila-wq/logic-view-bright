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

  const { auth_user_id, role_name, organization_id, email } = (req.body as any) || {}
  if (!role_name || (!auth_user_id && !email)) return res.status(400).json({ error: 'role_name and auth_user_id or email required' })

  let userId = auth_user_id as string | undefined
  if (!userId && email) {
    const lookup = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } })
    const txt = await lookup.text()
    let js: any
    try { js = txt ? JSON.parse(txt) : null } catch { js = txt }
    if (!lookup.ok) return res.status(500).json({ error: 'Failed to lookup user', details: js })
    userId = (js && js[0] && js[0].id) || null as any
    if (!userId) return res.status(404).json({ error: 'User not found for email' })
  }

  const ur = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/user_roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
    body: JSON.stringify({ auth_user_id: userId, role_name, created_at: new Date().toISOString() })
  })
  const urText = await ur.text()
  let urJson: any
  try { urJson = urText ? JSON.parse(urText) : null } catch { urJson = urText }
  if (!ur.ok) return res.status(ur.status).json({ error: 'Failed to assign role', details: urJson })

  if (organization_id) {
    await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/org_users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
      body: JSON.stringify({ organization_id, user_id: userId, role_name, created_at: new Date().toISOString() })
    }).catch(()=>{})
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin))
  return res.status(200).json({ success: true })
}

