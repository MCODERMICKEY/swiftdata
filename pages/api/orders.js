import { supabaseAdmin } from '../../lib/supabase'
import { generateRef } from '../../lib/bundles'
import twilio from 'twilio'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { network, bundleSize, bundlePrice, phone, recipient, paymentMethod } = req.body

  if (!network || !bundleSize || !bundlePrice || !phone || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const phoneClean = phone.replace(/\s+/g, '')
  if (!/^0[0-9]{9}$/.test(phoneClean)) {
    return res.status(400).json({ error: 'Invalid phone number. Use format: 0XXXXXXXXX' })
  }

  const reference = generateRef()

  // Save order to Supabase
  const { error: dbError } = await supabaseAdmin.from('orders').insert({
    reference,
    network,
    bundle_size: bundleSize,
    bundle_price: bundlePrice,
    phone: phoneClean,
    recipient: recipient || phoneClean,
    payment_method: paymentMethod,
    status: 'pending',
  })

  if (dbError) {
    console.error('DB Error:', dbError)
    return res.status(500).json({ error: 'Failed to save order. Please try again.' })
  }

  // Send WhatsApp notification to admin
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER

    if (accountSid && authToken && fromWhatsApp && adminNumber) {
      const client = twilio(accountSid, authToken)
      const netLabel = { mtn: 'MTN', vodafone: 'Vodafone', airteltigo: 'AirtelTigo' }[network] || network
      const payLabel = paymentMethod === 'momo' ? 'MTN MoMo' : 'Vodafone Cash'

      await client.messages.create({
        from: fromWhatsApp,
        to: adminNumber,
        body: `🆕 *New SwiftData Order!*\n\n📦 Bundle: ${netLabel} ${bundleSize}\n💰 Price: ${bundlePrice}\n📱 Phone: ${phoneClean}\n📲 Recipient: ${recipient || phoneClean}\n💳 Payment: ${payLabel}\n🔖 Ref: ${reference}\n\nReply DONE ${reference} to mark as delivered.`,
      })
    }
  } catch (twilioErr) {
    // Don't fail the order if WhatsApp fails — just log it
    console.warn('WhatsApp notification failed:', twilioErr.message)
  }

  return res.status(200).json({ success: true, reference })
}
