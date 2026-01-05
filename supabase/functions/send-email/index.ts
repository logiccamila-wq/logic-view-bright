export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.RESEND_API_KEY || ""
  if (!apiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY missing" })
  }

  const { to, subject, html, from, cc, bcc, reply_to, attachments } = req.body || {}

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from || "XYZ Logicflow <noreply@xyzlogicflow.tech>",
      to,
      subject,
      html,
      cc,
      bcc,
      reply_to,
      attachments,
    }),
  })

  const data = await r.json()
  return res.status(r.ok ? 200 : r.status).json(data)
}
