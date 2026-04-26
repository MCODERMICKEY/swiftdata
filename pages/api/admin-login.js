export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password } = req.body
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123'

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  // Simple token: base64 of password + timestamp (stateless, rotates each deploy)
  const token = Buffer.from(`${adminPassword}:${process.env.VERCEL_DEPLOYMENT_ID || 'local'}`).toString('base64')
  return res.status(200).json({ token })
}
