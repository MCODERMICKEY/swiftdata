import { supabaseAdmin } from '../../lib/supabase'

function verifyAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123'
  const expected = Buffer.from(`${adminPassword}:${process.env.VERCEL_DEPLOYMENT_ID || 'local'}`).toString('base64')
  return token === expected
}

export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { status, page = 1 } = req.query
    const pageSize = 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ orders: data, total: count, page: Number(page), pageSize })
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body
    if (!id || !status) return res.status(400).json({ error: 'Missing id or status' })

    const validStatuses = ['pending', 'processing', 'delivered', 'failed']
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
