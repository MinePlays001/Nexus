import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSettings, createOrder, editProduct, getProducts, type Settings } from '@/lib/db'
import { useAuth } from './__root'

export const Route = createFileRoute('/checkout')({ component: Checkout })

function Checkout() {
  const { cart, clearCart, user } = useAuth()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [txnId, setTxnId] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  useEffect(() => { getSettings().then(setSettings) }, [])

  if (!user) return (
    <main style={{ paddingTop: 64, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: 52, color: '#3d3468', marginBottom: 20 }} />
        <p style={{ color: '#6b5b9e', fontSize: 18, marginBottom: 16 }}>Login required to checkout</p>
        <Link to="/login" className="glow-btn" style={{ padding: '0.75rem 1.75rem', borderRadius: 12, color: '#fff', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Login</Link>
      </div>
    </main>
  )

  if (cart.length === 0) return (
    <main style={{ paddingTop: 64, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-shopping-cart" style={{ fontSize: 52, color: '#3d3468', marginBottom: 20 }} />
        <p style={{ color: '#6b5b9e', fontSize: 18, marginBottom: 16 }}>Your cart is empty</p>
        <Link to="/shop" className="glow-btn" style={{ padding: '0.75rem 1.75rem', borderRadius: 12, color: '#fff', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Browse Accounts</Link>
      </div>
    </main>
  )

  const total = cart.reduce((s, i) => s + i.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (!txnId.trim()) { setErr('Transaction ID is required.'); return }
    setLoading(true)
    try {
      // Validate stock
      const prods = await getProducts()
      for (const item of cart) {
        const p = prods.find(x => x.id === item.id)
        if (!p || p.stock <= 0) throw new Error(`"${item.title}" is out of stock.`)
      }
      // Create order
      await createOrder({
        buyer_email: user.email!,
        buyer_name: (user as any).user_metadata?.full_name ?? user.email!,
        items: cart.map(i => ({ id: i.id, title: i.title, price: i.price })),
        total,
        transaction_id: txnId.trim(),
        status: 'pending',
      })
      // Reduce stock
      for (const item of cart) {
        const p = prods.find(x => x.id === item.id)
        if (p) await editProduct(p.id, { stock: Math.max(0, p.stock - 1) })
      }
      clearCart()
      navigate({ to: '/orders' })
    } catch (e: any) { setErr(e.message ?? 'Something went wrong.') }
    setLoading(false)
  }

  return (
    <main style={{ paddingTop: 64 }}>
      <section style={{ maxWidth: 1024, margin: '0 auto', padding: '2.5rem 1.5rem' }} className="page-enter">
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 32 }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Order summary */}
            <div className="glow-border" style={{ borderRadius: 16, padding: 22, background: 'rgba(26,21,53,.35)' }}>
              <p style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#9b8ace', marginBottom: 18 }}>Order Summary</p>
              {cart.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(61,52,104,.3)' }}>
                  <span style={{ color: '#c4b8e8', fontSize: 14 }}>{i.title}</span>
                  <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700, fontSize: 14 }}>Rs {i.price.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Total</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 22, fontWeight: 900, color: '#a855f7' }} className="glow-text">Rs {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="glow-border" style={{ borderRadius: 16, padding: 22, background: 'rgba(26,21,53,.35)' }}>
              <p style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#9b8ace', marginBottom: 16 }}><i className="fas fa-credit-card" style={{ marginRight: 8 }} />Payment via JazzCash</p>
              <div style={{ background: 'rgba(36,30,66,.5)', borderRadius: 12, padding: 18, border: '1px solid rgba(61,52,104,.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#fff' }}>JazzCash</span>
                </div>
                <p style={{ color: '#e2e0ef', fontSize: 20, fontWeight: 700, letterSpacing: '0.05em' }}>{settings?.jazzcash_number ?? '03238581603'}</p>
                <p style={{ color: '#9b8ace', fontSize: 13, marginTop: 4 }}>Account: {settings?.jazzcash_name ?? 'Shamim Akhtar'}</p>
              </div>
              <div style={{ marginTop: 14, padding: '11px 14px', borderRadius: 10, background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.25)', fontSize: 13, color: '#facc15' }}>
                <i className="fas fa-info-circle" style={{ marginRight: 8 }} />
                Send <strong>Rs {total.toLocaleString()}</strong> to the number above, then paste your Transaction ID below.
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="glow-border" style={{ borderRadius: 16, padding: 22, background: 'rgba(26,21,53,.35)', position: 'sticky', top: 80 }}>
            <p style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#9b8ace', marginBottom: 22 }}>Confirm Payment</p>
            {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}>{err}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#9b8ace', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>JazzCash Transaction ID *</label>
                <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="e.g. TXN1234567890"
                  className="input-glow" required />
              </div>
              <div style={{ padding: '14px 0', borderTop: '1px solid rgba(61,52,104,.3)', borderBottom: '1px solid rgba(61,52,104,.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#6b5b9e' }}>Items</span><span style={{ color: '#e2e0ef' }}>{cart.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700, fontSize: 18 }}>Rs {total.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.2)', fontSize: 12, color: '#86efac' }}>
                <i className="fas fa-envelope" style={{ marginRight: 6 }} />Account details will be emailed to <strong>{user.email}</strong> after payment is confirmed.
              </div>
              <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '0.9rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 16 }}>
                {loading ? 'Submitting...' : <><i className="fas fa-paper-plane" style={{ marginRight: 8 }} />Submit Order</>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
