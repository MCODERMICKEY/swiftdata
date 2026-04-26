import { useState } from 'react'
import Head from 'next/head'
import { bundles, networkLabels, generateRef } from '../lib/bundles'

const STATUS_COLORS = {
  pending: '#F5A623',
  processing: '#3B82F6',
  delivered: '#22C55E',
  failed: '#EF4444',
}

export default function Home() {
  const [activeNetwork, setActiveNetwork] = useState('mtn')
  const [modal, setModal] = useState(null) // { size, price, network }
  const [phone, setPhone] = useState('')
  const [recipient, setRecipient] = useState('')
  const [payMethod, setPayMethod] = useState('momo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null) // { reference }
  const [trackRef, setTrackRef] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackError, setTrackError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function openModal(bundle, network) {
    setModal({ ...bundle, network })
    setPhone(''); setRecipient(''); setPayMethod('momo')
    setError(''); setSuccess(null)
  }

  function closeModal() {
    setModal(null); setSuccess(null); setError('')
  }

  async function submitOrder() {
    setError('')
    const phoneClean = phone.replace(/\s+/g, '')
    if (!/^0[0-9]{9}$/.test(phoneClean)) {
      setError('Please enter a valid 10-digit Ghana phone number (e.g. 0551234567)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: modal.network,
          bundleSize: modal.size,
          bundlePrice: modal.price,
          phone: phoneClean,
          recipient: recipient.replace(/\s+/g, '') || phoneClean,
          paymentMethod: payMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSuccess({ reference: data.reference })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function trackOrder() {
    setTrackError(''); setTrackResult(null)
    if (!trackRef.trim()) { setTrackError('Please enter a reference number'); return }
    setTrackLoading(true)
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(trackRef.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order not found')
      setTrackResult(data.order)
    } catch (e) {
      setTrackError(e.message)
    } finally {
      setTrackLoading(false)
    }
  }

  const netTabs = [
    { key: 'mtn', label: 'MTN Yellow', short: 'MTN', color: '#FFCC00', bg: 'rgba(255,204,0,0.08)' },
    { key: 'vodafone', label: 'Vodafone', short: 'VOD', color: '#ff4d60', bg: 'rgba(226,0,26,0.08)' },
    { key: 'airteltigo', label: 'AirtelTigo', short: 'AT', color: '#ff8c7a', bg: 'rgba(239,62,39,0.08)' },
  ]

  const sizeColors = { mtn: '#FFCC00', vodafone: '#ff4d60', airteltigo: '#ff8c7a' }

  return (
    <>
      <Head>
        <title>SwiftData — Affordable Data Bundles Ghana</title>
        <meta name="description" content="Buy MTN, Vodafone & AirtelTigo data bundles at the best prices in Ghana. Fast delivery, 10min–1hr." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style jsx global>{`
        :root {
          --gold: #F5A623; --gold-light: #FFD07A;
          --dark: #0D0D0D; --dark2: #161616; --dark3: #1E1E1E;
          --card: #1A1A1A; --border: rgba(255,255,255,0.07);
          --text: #F0F0F0; --muted: #888; --green: #22C55E;
          --radius: 16px;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        body { font-family:'DM Sans',sans-serif; background:var(--dark); color:var(--text); overflow-x:hidden; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',background:'rgba(13,13,13,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid var(--border)'}}>
        <a href="#" style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:'var(--gold)',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'var(--gold)',display:'inline-block'}}></span>
          SwiftData
        </a>
        <ul style={{display:'flex',gap:32,listStyle:'none',margin:0}}>
          {[['#bundles','Buy Data'],['#track','Track Order'],['#payment','Payment'],['#contact','Contact']].map(([href,label]) => (
            <li key={href}><a href={href} style={{color:'var(--muted)',fontSize:14,fontWeight:500,transition:'color .2s'}} onMouseEnter={e=>e.target.style.color='var(--text)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{label}</a></li>
          ))}
        </ul>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--green)',fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',display:'inline-block',animation:'pulse 2s infinite'}}></span>
            Open Now
          </div>
          <button onClick={()=>document.getElementById('bundles').scrollIntoView({behavior:'smooth'})} style={{background:'var(--gold)',color:'var(--dark)',border:'none',padding:'10px 22px',borderRadius:50,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            Buy Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:'relative',padding:'90px 40px 70px',textAlign:'center',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 70%)',pointerEvents:'none'}}></div>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.25)',color:'var(--gold)',fontSize:12,fontWeight:600,padding:'6px 16px',borderRadius:50,marginBottom:24,letterSpacing:'.05em',textTransform:'uppercase'}}>
          ⚡ Fast Delivery · 10min – 1hr
        </div>
        <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(36px,6vw,68px)',lineHeight:1.05,marginBottom:20}}>
          Ghana&apos;s Most<br/><span style={{color:'var(--gold)'}}>Affordable Data</span><br/>Bundles
        </h1>
        <p style={{fontSize:16,color:'var(--muted)',maxWidth:500,margin:'0 auto 36px',lineHeight:1.7}}>
          Buy MTN, Vodafone & AirtelTigo data bundles at the best rates. Instant delivery, no stress.
        </p>
        <div style={{display:'flex',gap:40,justifyContent:'center',flexWrap:'wrap',marginBottom:50}}>
          {[['500+','Happy Customers'],['10min','Avg. Delivery'],['24/7','Customer Support'],['100%','Secure Payment']].map(([num,label]) => (
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:800,color:'var(--gold)'}}>{num}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BUNDLES */}
      <section id="bundles" style={{padding:'0 40px 80px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:28,marginBottom:8}}>Choose Your Network</div>
        <div style={{color:'var(--muted)',fontSize:14,marginBottom:32}}>Select a network to view available data bundles and prices.</div>

        {/* Tabs */}
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:36}}>
          {netTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveNetwork(tab.key)} style={{display:'flex',alignItems:'center',gap:10,background: activeNetwork===tab.key ? tab.bg : 'var(--card)',border:`1.5px solid ${activeNetwork===tab.key ? tab.color : 'var(--border)'}`,color: activeNetwork===tab.key ? tab.color : 'var(--muted)',padding:'12px 24px',borderRadius:50,fontSize:14,fontWeight:500,transition:'all .2s',cursor:'pointer'}}>
              <span style={{width:24,height:24,borderRadius:'50%',background: activeNetwork===tab.key ? tab.bg : 'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:tab.color}}>{tab.short}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
          {bundles[activeNetwork].map(b => (
            <div key={b.size} onClick={() => openModal(b, activeNetwork)} style={{background:'var(--card)',border:`1.5px solid ${b.popular ? 'rgba(245,166,35,0.4)' : 'var(--border)'}`,borderRadius:'var(--radius)',padding:24,cursor:'pointer',transition:'all .25s',position:'relative',overflow:'hidden'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,.5)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor=b.popular?'rgba(245,166,35,0.4)':'var(--border)'}}>
              {b.popular && <div style={{position:'absolute',top:12,right:12,background:'var(--gold)',color:'var(--dark)',fontSize:9,fontWeight:700,padding:'3px 9px',borderRadius:50,textTransform:'uppercase',letterSpacing:'.06em'}}>Popular</div>}
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:32,marginBottom:4,color:sizeColors[activeNetwork]}}>{b.size}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginBottom:16}}>Valid for {b.validity}</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:22,color:'var(--gold)',marginBottom:16}}>{b.price} <span style={{fontSize:13,fontWeight:400,color:'var(--muted)'}}>/ bundle</span></div>
              <ul style={{listStyle:'none',marginBottom:20}}>
                {b.features.map(f => (
                  <li key={f} style={{fontSize:12,color:'var(--muted)',padding:'3px 0',display:'flex',alignItems:'center',gap:6}}>
                    <span style={{color:'var(--green)',fontWeight:700}}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button style={{width:'100%',padding:11,borderRadius:10,border:'1.5px solid var(--border)',background:'transparent',color:'var(--text)',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>{e.target.style.background='var(--gold)';e.target.style.borderColor='var(--gold)';e.target.style.color='var(--dark)'}}
                onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.borderColor='var(--border)';e.target.style.color='var(--text)'}}>
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TRACK ORDER */}
      <section id="track" style={{background:'var(--dark2)',border:'1px solid var(--border)',borderRadius:20,padding:40,maxWidth:1020,margin:'0 40px 60px',marginLeft:'auto',marginRight:'auto'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:26,marginBottom:8}}>🔍 Track Your Order</div>
        <p style={{color:'var(--muted)',fontSize:14,marginBottom:24}}>Enter your order reference number to check delivery status.</p>
        <div style={{display:'flex',gap:12,maxWidth:500}}>
          <input value={trackRef} onChange={e=>setTrackRef(e.target.value)} onKeyDown={e=>e.key==='Enter'&&trackOrder()} placeholder="e.g. SD-20260424-1234" style={{flex:1,background:'var(--dark3)',border:'1.5px solid var(--border)',borderRadius:12,padding:'14px 18px',color:'var(--text)',fontSize:14,outline:'none',transition:'border .2s'}} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          <button onClick={trackOrder} disabled={trackLoading} style={{background:'var(--gold)',border:'none',color:'var(--dark)',padding:'14px 28px',borderRadius:12,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,cursor:'pointer',whiteSpace:'nowrap',opacity:trackLoading?.7:1}}>
            {trackLoading ? '...' : 'Track Order'}
          </button>
        </div>
        {trackError && <p style={{marginTop:12,color:'#EF4444',fontSize:13}}>❌ {trackError}</p>}
        {trackResult && (
          <div style={{marginTop:16,background:'var(--dark3)',borderRadius:12,padding:'16px 20px',border:'1px solid var(--border)',display:'inline-block',animation:'fadeIn .3s ease'}}>
            <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Order: <strong style={{color:'var(--text)'}}>{trackResult.reference}</strong></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:16,fontSize:13}}>
              <span>📦 {networkLabels[trackResult.network]} {trackResult.bundle_size}</span>
              <span>💰 {trackResult.bundle_price}</span>
              <span>📱 {trackResult.phone}</span>
              <span style={{color:STATUS_COLORS[trackResult.status]||'var(--muted)',fontWeight:600,textTransform:'capitalize'}}>
                ● {trackResult.status}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* PAYMENT */}
      <section id="payment" style={{background:'linear-gradient(135deg,rgba(245,166,35,0.08) 0%,transparent 60%)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:20,padding:40,maxWidth:1020,margin:'0 auto 60px'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:26,marginBottom:8}}>💳 How to Pay</div>
        <p style={{color:'var(--muted)',fontSize:14,marginBottom:28}}>We accept Mobile Money and Vodafone Cash. Fast, secure, and hassle-free.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {[
            {icon:'💛',bg:'rgba(255,204,0,0.12)',title:'MTN Mobile Money',desc:'Send payment to our MoMo number. Use your phone number as the reference.',num:'055 XXX XXXX'},
            {icon:'❤️',bg:'rgba(226,0,26,0.12)',title:'Vodafone Cash',desc:'Send payment to our Vodafone Cash number. Use your phone number as the reference.',num:'020 XXX XXXX'},
          ].map(p => (
            <div key={p.title} style={{background:'var(--dark2)',border:'1px solid var(--border)',borderRadius:14,padding:24,display:'flex',alignItems:'flex-start',gap:16}}>
              <div style={{width:48,height:48,borderRadius:12,background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{p.icon}</div>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.5}}>{p.desc}</div>
                <div style={{fontFamily:'monospace',fontSize:15,color:'var(--gold)',marginTop:6}}>{p.num}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:20,padding:'16px 20px',background:'var(--dark2)',borderRadius:12,border:'1px solid var(--border)'}}>
          <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>
            <strong style={{color:'var(--text)'}}>📌 Steps:</strong> 1) Choose a bundle → 2) Enter your phone number → 3) Select payment method → 4) Send payment → 5) Receive your data within 10–60 minutes.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{borderTop:'1px solid var(--border)',padding:40,display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:1100,margin:'0 auto',flexWrap:'wrap',gap:20}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'var(--gold)'}}>⚡ SwiftData</div>
          <p style={{fontSize:13,color:'var(--muted)',marginTop:6}}>Affordable data bundles for all networks in Ghana.<br/>© {new Date().getFullYear()} SwiftData. All rights reserved.</p>
        </div>
        <div style={{display:'flex',gap:12}}>
          <a href="tel:0200000000" style={{display:'flex',alignItems:'center',gap:8,background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'10px 18px',borderRadius:50,fontSize:13,fontWeight:500}}>📞 Call Us</a>
          <a href="https://wa.me/233200000000" target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'var(--green)',padding:'10px 18px',borderRadius:50,fontSize:13,fontWeight:500}}>💬 WhatsApp</a>
        </div>
      </footer>

      {/* ORDER MODAL */}
      {modal && (
        <div onClick={e=>e.target===e.currentTarget&&closeModal()} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn .2s ease'}}>
          <div style={{background:'var(--dark2)',border:'1px solid var(--border)',borderRadius:20,padding:36,width:'100%',maxWidth:440,position:'relative',animation:'slideUp .25s ease'}}>
            <button onClick={closeModal} style={{position:'absolute',top:16,right:16,background:'var(--card)',border:'1px solid var(--border)',color:'var(--muted)',width:32,height:32,borderRadius:'50%',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>✕</button>

            {!success ? (
              <>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:22,marginBottom:6}}>Place Your Order</div>
                <p style={{color:'var(--muted)',fontSize:13,marginBottom:24}}>Fill in your details and we'll deliver your data bundle fast.</p>

                {/* Summary */}
                <div style={{background:'var(--dark3)',borderRadius:12,padding:16,marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:11,color:'var(--muted)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.04em'}}>Selected Bundle</div>
                    <div style={{fontWeight:600,fontSize:15}}>{networkLabels[modal.network]} {modal.size}</div>
                  </div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:20,color:'var(--gold)'}}>{modal.price}</div>
                </div>

                {/* Phone */}
                <div style={{marginBottom:18}}>
                  <label style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginBottom:8,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>Your Phone Number *</label>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. 0551234567" style={{width:'100%',background:'var(--dark3)',border:'1.5px solid var(--border)',borderRadius:10,padding:'13px 16px',color:'var(--text)',fontSize:14,outline:'none',transition:'border .2s'}} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>

                {/* Recipient */}
                <div style={{marginBottom:18}}>
                  <label style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginBottom:8,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>Recipient Number (if different)</label>
                  <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Leave blank if same as above" style={{width:'100%',background:'var(--dark3)',border:'1.5px solid var(--border)',borderRadius:10,padding:'13px 16px',color:'var(--text)',fontSize:14,outline:'none',transition:'border .2s'}} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                </div>

                {/* Payment */}
                <div style={{marginBottom:20}}>
                  <label style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginBottom:8,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>Payment Method</label>
                  <div style={{display:'flex',gap:12}}>
                    {[{key:'momo',icon:'💛',label:'MoMo',sub:'MTN Mobile Money'},{key:'voda',icon:'❤️',label:'Voda Cash',sub:'Vodafone Cash'}].map(opt => (
                      <div key={opt.key} onClick={()=>setPayMethod(opt.key)} style={{flex:1,background:'var(--dark3)',border:`1.5px solid ${payMethod===opt.key?'var(--gold)':'var(--border)'}`,borderRadius:10,padding:'14px 12px',cursor:'pointer',textAlign:'center',background: payMethod===opt.key?'rgba(245,166,35,0.08)':'var(--dark3)',transition:'all .2s'}}>
                        <div style={{fontSize:20,marginBottom:4}}>{opt.icon}</div>
                        <div style={{fontSize:12,fontWeight:600}}>{opt.label}</div>
                        <div style={{fontSize:10,color:'var(--muted)',marginTop:2}}>{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p style={{color:'#EF4444',fontSize:13,marginBottom:14}}>⚠️ {error}</p>}

                <button onClick={submitOrder} disabled={loading} style={{width:'100%',padding:15,background:'var(--gold)',border:'none',borderRadius:12,color:'var(--dark)',fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {loading ? <><span style={{width:18,height:18,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'var(--dark)',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}></span> Placing order...</> : 'Confirm Order →'}
                </button>
              </>
            ) : (
              <div style={{textAlign:'center',animation:'slideUp .3s ease'}}>
                <div style={{width:64,height:64,background:'rgba(34,197,94,0.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 20px'}}>✅</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,marginBottom:8}}>Order Placed!</div>
                <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.6}}>Your data bundle order has been received. You'll receive your data within <strong style={{color:'var(--text)'}}>10–60 minutes</strong>.</p>
                <div style={{background:'var(--dark3)',borderRadius:10,padding:14,fontFamily:'monospace',fontSize:16,color:'var(--gold)',margin:'20px 0',letterSpacing:'.1em'}}>{success.reference}</div>
                <p style={{fontSize:12,color:'var(--muted)',marginBottom:24}}>Save this reference number to track your order.</p>
                <button onClick={closeModal} style={{width:'100%',padding:15,background:'var(--gold)',border:'none',borderRadius:12,color:'var(--dark)',fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer'}}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
