import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getOrders, type Order } from '@/lib/db'
import { useAuth } from './__root'

export const Route = createFileRoute('/orders')({ component: Orders })

function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) getOrders().then(all => { setOrders(all.filter(o => o.buyer_email === user.email)); setLoading(false) })
    else setLoading(false)
  }, [user])

  if (!user) return (
    <main style={{ paddingTop: 64, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Link to="/login" className="glow-btn" style={{ padding: '0.75rem 1.75rem', borderRadius: 12, color: '#fff', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Login to View Orders</Link>
      </div>
    </main>
  )

  return (
    <main style={{ paddingTop: 64 }}>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 1.5rem' }} className="page-enter">
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 28 }}>My Orders</h1>

        {loading ? <div className="spinner" style={{ margin: '4rem auto' }} /> :
        orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <i className="fas fa-box-open" style={{ fontSize: 50, color: '#3d3468', marginBottom: 18 }} />
            <p style={{ color: '#6b5b9e', fontSize: 18, marginBottom: 16 }}>No orders yet</p>
            <Link to="/shop" className="glow-btn" style={{ padding: '0.75rem 1.75rem', borderRadius: 12, color: '#fff', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </section>
    </main>
  )
}

function OrderCard({ order: o }: { order: Order }) {
  return (
    <div className="glow-border" style={{ borderRadius: 16, padding: 22, background: 'rgba(26,21,53,.35)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ color: '#6b5b9e', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }}>Order #{o.id.slice(0, 12)}</p>
          <p style={{ color: '#e2e0ef', fontSize: 13 }}>{new Date(o.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <span className={`badge-${o.status}`} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{o.status}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
        {o.items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#9b8ace' }}>{i.title}</span>
            <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700 }}>Rs {i.price.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, paddingTop: 12, borderTop: '1px solid rgba(61,52,104,.3)' }}>
        <span style={{ color: '#6b5b9e' }}>Txn: <span style={{ color: '#e2e0ef', fontFamily: 'monospace' }}>{o.transaction_id}</span></span>
        <span style={{ color: '#6b5b9e' }}>Total: <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700 }}>Rs {o.total.toLocaleString()}</span></span>
      </div>

      {o.status === 'paid' && (
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)' }}>
          <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, marginBottom: 8 }}><i className="fas fa-envelope" style={{ marginRight: 8 }} />Account Details Sent</p>
          {o.account_details ? (
            <pre style={{ color: '#86efac', fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{o.account_details}</pre>
          ) : (
            <p style={{ color: '#86efac', fontSize: 13 }}>Check your email ({o.buyer_email}) for account login details.</p>
          )}
        </div>
      )}

      {o.status === 'rejected' && o.reject_reason && (
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)' }}>
          <p style={{ color: '#f87171', fontWeight: 700, fontSize: 13, marginBottom: 6 }}><i className="fas fa-times-circle" style={{ marginRight: 8 }} />Rejected</p>
          <p style={{ color: '#fca5a5', fontSize: 13 }}>{o.reject_reason}</p>
        </div>
      )}

      {o.status === 'pending' && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.25)', fontSize: 13, color: '#facc15' }}>
          <i className="fas fa-clock" style={{ marginRight: 8 }} />Awaiting admin verification. You'll receive account details by email once confirmed.
        </div>
      )}
    </div>
  )
}
