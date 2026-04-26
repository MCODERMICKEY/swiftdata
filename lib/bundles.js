export const bundles = {
  mtn: [
    { size: '100MB', validity: '24 Hours', price: 'GH₵ 1.00', priceNum: 1.00, features: ['Social media', 'WhatsApp', 'Light browsing'] },
    { size: '1GB',   validity: '1 Month',  price: 'GH₵ 5.00', priceNum: 5.00, features: ['All apps', 'Streaming', 'Social media'], popular: true },
    { size: '2GB',   validity: '1 Month',  price: 'GH₵ 9.00', priceNum: 9.00, features: ['All apps', 'Streaming', 'Video calls'] },
    { size: '3GB',   validity: '1 Month',  price: 'GH₵ 13.00', priceNum: 13.00, features: ['All apps', 'HD Streaming', 'Gaming'] },
    { size: '5GB',   validity: '1 Month',  price: 'GH₵ 20.00', priceNum: 20.00, features: ['All apps', '4K Streaming', 'Downloads'], popular: true },
    { size: '10GB',  validity: '1 Month',  price: 'GH₵ 38.00', priceNum: 38.00, features: ['All apps', 'Unlimited streaming', 'Work from home'] },
    { size: '20GB',  validity: '1 Month',  price: 'GH₵ 70.00', priceNum: 70.00, features: ['All apps', 'Heavy usage', 'Multiple devices'] },
    { size: '50GB',  validity: '1 Month',  price: 'GH₵ 160.00', priceNum: 160.00, features: ['All apps', 'Mega plan', 'Best value'] },
  ],
  vodafone: [
    { size: '200MB', validity: '24 Hours', price: 'GH₵ 1.50', priceNum: 1.50, features: ['Social media', 'WhatsApp', 'Light browsing'] },
    { size: '1GB',   validity: '1 Month',  price: 'GH₵ 5.50', priceNum: 5.50, features: ['All apps', 'Streaming', 'Social media'], popular: true },
    { size: '2GB',   validity: '1 Month',  price: 'GH₵ 10.00', priceNum: 10.00, features: ['All apps', 'Streaming', 'Video calls'] },
    { size: '5GB',   validity: '1 Month',  price: 'GH₵ 22.00', priceNum: 22.00, features: ['All apps', 'HD Streaming', 'Gaming'], popular: true },
    { size: '10GB',  validity: '1 Month',  price: 'GH₵ 40.00', priceNum: 40.00, features: ['All apps', '4K Streaming', 'Downloads'] },
    { size: '25GB',  validity: '1 Month',  price: 'GH₵ 85.00', priceNum: 85.00, features: ['All apps', 'Heavy usage', 'Best value'] },
  ],
  airteltigo: [
    { size: '150MB', validity: '24 Hours', price: 'GH₵ 1.00', priceNum: 1.00, features: ['Social media', 'WhatsApp', 'Light browsing'] },
    { size: '1GB',   validity: '1 Month',  price: 'GH₵ 4.50', priceNum: 4.50, features: ['All apps', 'Streaming', 'Social media'], popular: true },
    { size: '2GB',   validity: '1 Month',  price: 'GH₵ 8.50', priceNum: 8.50, features: ['All apps', 'Streaming', 'Video calls'] },
    { size: '5GB',   validity: '1 Month',  price: 'GH₵ 19.00', priceNum: 19.00, features: ['All apps', 'HD Streaming', 'Gaming'], popular: true },
    { size: '10GB',  validity: '1 Month',  price: 'GH₵ 36.00', priceNum: 36.00, features: ['All apps', '4K Streaming', 'Downloads'] },
    { size: '20GB',  validity: '1 Month',  price: 'GH₵ 65.00', priceNum: 65.00, features: ['All apps', 'Heavy usage', 'Best value'] },
  ],
}

export const networkLabels = {
  mtn: 'MTN Yellow',
  vodafone: 'Vodafone',
  airteltigo: 'AirtelTigo',
}

export function generateRef() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SD-${date}-${rand}`
}
