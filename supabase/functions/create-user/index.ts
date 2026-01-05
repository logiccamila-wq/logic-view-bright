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
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' })

  const { email, password, name, role, organization_id } = (req.body as any) || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const createResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name: name || null, role: role || null } })
  })
  const createText = await createResp.text()
  let createJson: any
  try { createJson = createText ? JSON.parse(createText) : null } catch { createJson = createText }
  if (!createResp.ok) return res.status(createResp.status).json({ error: 'Failed to create user', details: createJson })
  const userId = createJson?.id

  const usersResp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Prefer: 'return=representation' },
    body: JSON.stringify({ id: userId, email, name: name || null, role: role || null, created_at: new Date().toISOString() })
  })
  const usersText = await usersResp.text()
  let usersJson: any
  try { usersJson = usersText ? JSON.parse(usersText) : null } catch { usersJson = usersText }
  if (!usersResp.ok) {
    await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } }).catch(()=>{})
    return res.status(usersResp.status).json({ error: 'Failed to insert user metadata', details: usersJson })
  }

  if (organization_id) {
    await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/org_users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
      body: JSON.stringify({ organization_id, user_id: userId, role_name: role || 'member', created_at: new Date().toISOString() })
    }).catch(()=>{})
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin))
  return res.status(201).json({ id: userId })
}

