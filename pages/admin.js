import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const STATUS_META = {
  pending:    { label: 'Pending',    color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  processing: { label: 'Processing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  delivered:  { label: 'Delivered',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  failed:     { label: 'Failed',     color: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
}

const NET_LABELS = { mtn: 'MTN', vodafone: 'Vodafone', airteltigo: 'AirtelTigo' }

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [loginErr, setLoginErr]   = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [token, setToken]         = useState('')

  const [orders, setOrders]       = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [filterStatus, setFilter] = useState('all')
  const [fetching, setFetching]   = useState(false)
  const [updating, setUpdating]   = useState(null)
  const [search, setSearch]       = useState('')

  const pageSize = 20

  const fetchOrders = useCallback(async (pg = 1, status = filterStatus, tok = token) => {
    setFetching(true)
    try {
      const params = new URLSearchParams({ page: pg, status })
      const res = await fetch(`/api/admin-orders?${params}`, {
        headers: { Authorization: `Bearer ${tok}` },
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPage(pg)
    } catch {}
    setFetching(false)
  }, [filterStatus, token])

  useEffect(() => {
    const saved = sessionStorage.getItem('swiftdata_admin_token')
    if (saved) { setToken(saved); setAuthed(true) }
  }, [])

  useEffect(() => {
    if (authed && token) fetchOrders(1, filterStatus, token)
  }, [authed, token, filterStatus])

  async function login() {
    setLoginErr(''); setLoginLoading(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid password')
      sessionStorage.setItem('swiftdata_admin_token', data.token)
      setToken(data.token)
      setAuthed(true)
    } catch (e) {
      setLoginErr(e.message)
    }
    setLoginLoading(false)
  }

  async function updateStatus(id, status) {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      }
    } catch {}
    setUpdating(null)
  }

  function logout() {
    sessionStorage.removeItem('swiftdata_admin_token')
    setAuthed(false); setToken(''); setPassword('')
  }

  const filtered = orders.filter(o =>
    !search || o.reference.includes(search.toUpperCase()) || o.phone.includes(search)
  )

  const stats = {
    total,
    pending:   orders.filter(o=>o.status==='pending').length,
    delivered: orders.filter(o=>o.status==='delivered').length,
    processing:orders.filter(o=>o.status==='processing').length,
  }

  if (!authed) return (
    <>
      <Head><title>Admin Login — SwiftData</title></Head>
      <style jsx global>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#0D0D0D;color:#F0F0F0;}
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(245,166,35,0.1) 0%,transparent 70%)'}}>
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,padding:40,width:'100%',maxWidth:380}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:24,color:'#F5A623',marginBottom:4}}>⚡ SwiftData</div>
          <div style={{color:'#888',fontSize:14,marginBottom:32}}>Admin Dashboard</div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:'#888',marginBottom:8,display:'block',textTransform:'uppercase',letterSpacing:'.04em'}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Enter admin password" style={{width:'100%',background:'#1E1E1E',border:'1.5px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'13px 16px',color:'#F0F0F0',fontSize:14,outline:'none'}}/>
          </div>
          {loginErr && <p style={{color:'#EF4444',fontSize:13,marginBottom:12}}>⚠️ {loginErr}</p>}
          <button onClick={login} disabled={loginLoading} style={{width:'100%',padding:14,background:'#F5A623',border:'none',borderRadius:12,color:'#0D0D0D',fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {loginLoading ? <span style={{width:18,height:18,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'#0D0D0D',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}></span> : 'Login →'}
          </button>
          <div style={{marginTop:20,fontSize:12,color:'#555',textAlign:'center'}}>
            <a href="/" style={{color:'#888'}}>← Back to store</a>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin — SwiftData</title></Head>
      <style jsx global>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#0D0D0D;color:#F0F0F0;}
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        select option{background:#1E1E1E;color:#F0F0F0;}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#161616}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
      `}</style>

      {/* TOP BAR */}
      <nav style={{position:'sticky',top:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 32px',background:'rgba(13,13,13,0.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color:'#F5A623'}}>⚡ SwiftData Admin</div>
          <div style={{fontSize:11,color:'#555',marginTop:1}}>Order Management Dashboard</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <a href="/" target="_blank" style={{fontSize:13,color:'#888',padding:'8px 16px',background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,display:'flex',alignItems:'center',gap:6}}>🌐 View Store</a>
          <button onClick={logout} style={{fontSize:13,color:'#888',padding:'8px 16px',background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,cursor:'pointer'}}>Logout</button>
        </div>
      </nav>

      <div style={{padding:'28px 32px',maxWidth:1200,margin:'0 auto'}}>

        {/* STATS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
          {[
            {label:'Total Orders',val:total,icon:'📦',color:'#F5A623'},
            {label:'Pending',val:stats.pending,icon:'⏳',color:'#F5A623'},
            {label:'Processing',val:stats.processing,icon:'🔄',color:'#3B82F6'},
            {label:'Delivered',val:stats.delivered,icon:'✅',color:'#22C55E'},
          ].map(s => (
            <div key={s.label} style={{background:'#161616',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:20}}>
              <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:28,color:s.color}}>{s.val}</div>
              <div style={{fontSize:12,color:'#888',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ref or phone..." style={{flex:1,minWidth:200,background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'10px 16px',color:'#F0F0F0',fontSize:13,outline:'none'}}/>
          <div style={{display:'flex',gap:8}}>
            {['all','pending','processing','delivered','failed'].map(s => (
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'8px 16px',borderRadius:20,border:`1px solid ${filterStatus===s?'rgba(245,166,35,0.5)':'rgba(255,255,255,0.07)'}`,background: filterStatus===s?'rgba(245,166,35,0.1)':'#1A1A1A',color: filterStatus===s?'#F5A623':'#888',fontSize:12,fontWeight:500,cursor:'pointer',textTransform:'capitalize'}}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={()=>fetchOrders(page)} disabled={fetching} style={{padding:'8px 14px',background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,color:'#888',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
            {fetching?<span style={{width:12,height:12,border:'2px solid #555',borderTopColor:'#F5A623',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}></span>:'🔄'} Refresh
          </button>
        </div>

        {/* TABLE */}
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,0.02)'}}>
                  {['Reference','Network','Bundle','Price','Phone','Recipient','Payment','Date','Status','Action'].map(h => (
                    <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.04em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetching && orders.length === 0 ? (
                  <tr><td colSpan={10} style={{padding:40,textAlign:'center',color:'#555'}}>Loading orders...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{padding:40,textAlign:'center',color:'#555'}}>No orders found.</td></tr>
                ) : filtered.map((order, i) => {
                  const sm = STATUS_META[order.status] || STATUS_META.pending
                  return (
                    <tr key={order.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',animation:'fadeIn .3s ease',animationDelay:`${i*0.03}s`,animationFillMode:'both'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px',fontSize:12,fontFamily:'monospace',color:'#F5A623',whiteSpace:'nowrap'}}>{order.reference}</td>
                      <td style={{padding:'12px 16px',fontSize:12,whiteSpace:'nowrap'}}>{NET_LABELS[order.network]||order.network}</td>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>{order.bundle_size}</td>
                      <td style={{padding:'12px 16px',fontSize:12,color:'#F5A623',whiteSpace:'nowrap'}}>{order.bundle_price}</td>
                      <td style={{padding:'12px 16px',fontSize:12,fontFamily:'monospace',whiteSpace:'nowrap'}}>{order.phone}</td>
                      <td style={{padding:'12px 16px',fontSize:12,fontFamily:'monospace',color:'#888',whiteSpace:'nowrap'}}>{order.recipient||order.phone}</td>
                      <td style={{padding:'12px 16px',fontSize:11,color:'#888',whiteSpace:'nowrap',textTransform:'capitalize'}}>{order.payment_method==='momo'?'MoMo':'Voda Cash'}</td>
                      <td style={{padding:'12px 16px',fontSize:11,color:'#666',whiteSpace:'nowrap'}}>{new Date(order.created_at).toLocaleDateString('en-GH',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                      <td style={{padding:'12px 16px',whiteSpace:'nowrap'}}>
                        <span style={{display:'inline-flex',alignItems:'center',gap:5,background:sm.bg,color:sm.color,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20,textTransform:'capitalize'}}>
                          <span style={{width:5,height:5,borderRadius:'50%',background:sm.color}}></span>
                          {sm.label}
                        </span>
                      </td>
                      <td style={{padding:'12px 16px',whiteSpace:'nowrap'}}>
                        <select value={order.status} disabled={updating===order.id}
                          onChange={e=>updateStatus(order.id, e.target.value)}
                          style={{background:'#1E1E1E',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 10px',color:'#F0F0F0',fontSize:12,cursor:'pointer',outline:'none',opacity:updating===order.id?.5:1}}>
                          {['pending','processing','delivered','failed'].map(s=>(
                            <option key={s} value={s} style={{textTransform:'capitalize'}}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {total > pageSize && (
            <div style={{padding:'14px 20px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:12,color:'#888'}}>Showing {((page-1)*pageSize)+1}–{Math.min(page*pageSize,total)} of {total} orders</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>fetchOrders(page-1)} disabled={page===1||fetching} style={{padding:'6px 14px',background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,color:'#888',fontSize:12,cursor:'pointer',opacity:page===1?.4:1}}>← Prev</button>
                <button onClick={()=>fetchOrders(page+1)} disabled={page*pageSize>=total||fetching} style={{padding:'6px 14px',background:'#1A1A1A',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,color:'#888',fontSize:12,cursor:'pointer',opacity:page*pageSize>=total?.4:1}}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
