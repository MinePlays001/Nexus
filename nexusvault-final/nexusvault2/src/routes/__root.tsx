import { createRootRoute, HeadContent, Scripts, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getUser, signOut } from '@/lib/db'
import '@/styles.css'

// ─── Auth Context ─────────────────────────────────────────────────
type CartItem = { id: string; title: string; price: number; stock: number }
type Ctx = {
  user: User | null
  setUser: (u: User | null) => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}
const AuthCtx = createContext<Ctx>({
  user: null, setUser: () => {}, cart: [],
  addToCart: () => {}, removeFromCart: () => {}, clearCart: () => {}
})
export const useAuth = () => useContext(AuthCtx)

// ─── Route ────────────────────────────────────────────────────────
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'NexusVault — Premium Digital Accounts' },
    ],
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
    ],
  }),
  shellComponent: Shell,
})

function Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    getUser().then(u => { if (u) setUser(u as User) })
    try { const s = localStorage.getItem('nv2_cart'); if (s) setCart(JSON.parse(s)) } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('nv2_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart(prev => prev.find(c => c.id === item.id) ? prev : [...prev, item])
  }
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id))
  const clearCart = () => setCart([])

  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body style={{ background: '#0a0814', color: '#e2e0ef', minHeight: '100vh' }}>
        <AuthCtx.Provider value={{ user, setUser, cart, addToCart, removeFromCart, clearCart }}>
          <Navbar />
          {children}
          <Footer />
        </AuthCtx.Provider>
        <Scripts />
      </body>
    </html>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const { user, setUser, cart } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut(); setUser(null); navigate({ to: '/' })
  }

  return (
    <nav style={{ position: 'fixed', top: 0, insetInline: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(10,8,20,0.85)', borderBottom: '1px solid rgba(147,51,234,0.12)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(147,51,234,0.45)' }}>
            <i className="fas fa-vault" style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <span style={{ fontFamily: 'Orbitron', fontSize: 17, color: '#fff', letterSpacing: '0.08em' }}>NexusVault</span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/shop" style={{ color: '#9b8ace', textDecoration: 'none', fontSize: 14 }}>Shop</Link>
          {user && <Link to="/orders" style={{ color: '#9b8ace', textDecoration: 'none', fontSize: 14 }}>My Orders</Link>}

          {cart.length > 0 && (
            <Link to="/checkout" style={{ position: 'relative', color: '#9b8ace', textDecoration: 'none', fontSize: 18 }}>
              <i className="fas fa-shopping-cart" />
              <span style={{ position: 'absolute', top: -7, right: -7, width: 17, height: 17, background: '#7c3aed', borderRadius: '50%', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cart.length}</span>
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {(user.email || 'U')[0].toUpperCase()}
              </div>
              <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', color: '#9b8ace', cursor: 'pointer', fontSize: 16 }}>
                <i className="fas fa-sign-out-alt" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="glow-btn" style={{ padding: '0.45rem 1.1rem', borderRadius: 10, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(147,51,234,0.1)', marginTop: 80, padding: '3rem 1.5rem', background: 'rgba(10,8,20,0.6)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-vault" style={{ color: '#fff', fontSize: 12 }} />
            </div>
            <span style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: 14 }}>NexusVault</span>
          </div>
          <p style={{ color: '#6b5b9e', fontSize: 13, lineHeight: 1.7 }}>Premium digital accounts with instant delivery. Secure & trusted.</p>
        </div>
        <div>
          <p style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#9b8ace', letterSpacing: '0.1em', marginBottom: 14 }}>LINKS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['/', 'Home'], ['/shop', 'Shop'], ['/orders', 'My Orders']].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: '#6b5b9e', textDecoration: 'none', fontSize: 13 }}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#9b8ace', letterSpacing: '0.1em', marginBottom: 14 }}>PAYMENT</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#e2e0ef', fontSize: 14, fontWeight: 600 }}>JazzCash</span>
          </div>
          <p style={{ color: '#9b8ace', fontSize: 13 }}>03238581603</p>
          <p style={{ color: '#6b5b9e', fontSize: 12 }}>Shamim Akhtar</p>
        </div>
      </div>
      <p style={{ textAlign: 'center', color: '#3d3468', fontSize: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(61,52,104,0.3)' }}>
        © {new Date().getFullYear()} NexusVault. All rights reserved.
      </p>
    </footer>
  )
}
