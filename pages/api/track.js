import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { ref } = req.query
  if (!ref) return res.status(400).json({ error: 'Reference required' })

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('reference, network, bundle_size, bundle_price, phone, status, created_at')
    .eq('reference', ref.toUpperCase())
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Order not found' })
  }

  return res.status(200).json({ order: data })
}
