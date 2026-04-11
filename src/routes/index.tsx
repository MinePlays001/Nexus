import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCategories, getProducts, type Category, type Product } from '@/lib/db'
import { useAuth } from './__root'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [cats, setCats] = useState<Category[]>([])
  const [prods, setProds] = useState<Product[]>([])
  const { cart, addToCart } = useAuth()

  useEffect(() => {
    getCategories().then(setCats)
    getProducts().then(setProds)
  }, [])

  return (
    <main style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 50%, rgba(147,51,234,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(168,85,247,0.12) 0%, transparent 55%)' }} />
        {/* floating orbs */}
        <div style={{ position: 'absolute', right: '8%', top: '20%', width: 400, height: 400, background: 'rgba(124,58,237,0.08)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', left: '30%', bottom: '10%', width: 250, height: 250, background: 'rgba(168,85,247,0.07)', borderRadius: '50%', filter: 'blur(60px)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 1.5rem', position: 'relative', zIndex: 1 }} className="page-enter">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, border: '1px solid rgba(147,51,234,0.35)', background: 'rgba(147,51,234,0.1)', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#9b8ace', fontSize: 13, fontWeight: 500 }}>Trusted by 1,000+ buyers</span>
          </div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(2.2rem,5.5vw,4.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20 }} className="glow-text">
            Premium Digital<br />Accounts
          </h1>
          <p style={{ fontSize: 18, color: '#9b8ace', maxWidth: 540, lineHeight: 1.7, marginBottom: 36 }}>
            Instant delivery of verified Steam, Roblox &amp; Minecraft accounts. Secure checkout via JazzCash.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/shop" className="glow-btn" style={{ padding: '0.85rem 2rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-rocket" /> Browse Store
            </Link>
            <Link to="/shop" style={{ padding: '0.85rem 2rem', borderRadius: 12, border: '1px solid rgba(147,51,234,0.4)', color: '#9b8ace', fontWeight: 600, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-tags" /> View Deals
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 40, fontSize: 13, color: '#6b5b9e' }}>
            {[['fa-shield-alt', 'Secure Accounts'], ['fa-bolt', 'Instant Delivery'], ['fa-lock', 'Login Required']].map(([icon, label]) => (
              <span key={label}><i className={`fas ${icon}`} style={{ color: '#a855f7', marginRight: 6 }} />{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <SectionHeader title="Categories" sub="Browse by game platform" link="/shop" linkLabel="View All" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 32 }}>
          {cats.map(c => (
            <Link key={c.id} to="/shop" search={{ cat: c.id }} style={{ textDecoration: 'none' }}>
              <div className="glow-border" style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ position: 'relative', paddingBottom: '60%' }}>
                  <img src={c.image} alt={c.name} onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,8,20,.9),transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                    <p style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff' }}>{c.name}</p>
                    <p style={{ color: '#6b5b9e', fontSize: 11, marginTop: 3 }}>{prods.filter(p => p.category_id === c.id).length} accounts</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <SectionHeader title="Featured Accounts" sub="Best sellers this week" link="/shop" linkLabel="See All" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24, marginTop: 32 }}>
          {prods.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} cat={cats.find(c => c.id === p.category_id)} inCart={!!cart.find(c => c.id === p.id)} onAdd={() => addToCart({ id: p.id, title: p.title, price: p.price, stock: p.stock })} />
          ))}
        </div>
      </section>

      {/* Trust */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div className="glow-border" style={{ borderRadius: 24, padding: '3rem', background: 'rgba(26,21,53,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[
              { icon: 'fa-shield-check', title: 'Verified Accounts', desc: 'Every account checked before delivery' },
              { icon: 'fa-bolt', title: 'Fast Delivery', desc: 'Account details sent to your email minutes after payment' },
              { icon: 'fa-envelope', title: 'Email Delivery', desc: 'Receive login details securely in your inbox' },
            ].map(i => (
              <div key={i.title} style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: 16, background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${i.icon}`} style={{ color: '#a855f7', fontSize: 22 }} />
                </div>
                <p style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: 14, marginBottom: 8 }}>{i.title}</p>
                <p style={{ color: '#6b5b9e', fontSize: 13 }}>{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// ─── Shared Components ────────────────────────────────────────────
function SectionHeader({ title, sub, link, linkLabel }: { title: string; sub: string; link: string; linkLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: '#fff' }}>{title}</h2>
        <p style={{ color: '#6b5b9e', fontSize: 14, marginTop: 6 }}>{sub}</p>
      </div>
      <Link to={link} style={{ color: '#a855f7', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>{linkLabel} →</Link>
    </div>
  )
}

export function ProductCard({ product, cat, inCart, onAdd }: { product: Product; cat?: Category; inCart: boolean; onAdd: () => void }) {
  const outOfStock = product.stock <= 0
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Link to="/product/$id" params={{ id: product.id }} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', paddingBottom: '72%', overflow: 'hidden' }}>
          <img src={product.image} alt={product.title} onError={(e) => (e.currentTarget.src = '/placeholder.png')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} />
          {outOfStock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,20,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Orbitron', color: '#f87171', fontSize: 12, border: '1px solid rgba(239,68,68,.4)', padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,.1)' }}>OUT OF STOCK</span>
            </div>
          )}
          {/* Stock badge */}
          {!outOfStock && product.stock <= 5 && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(234,179,8,.15)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#facc15' }} className="stock-low">
              <i className="fas fa-fire" style={{ marginRight: 4 }} />Only {product.stock} left
            </div>
          )}
        </div>
      </Link>
      <div style={{ padding: 16 }}>
        <p style={{ color: '#6b5b9e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{cat?.name || 'Digital'}</p>
        <h3 style={{ color: '#e2e0ef', fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 14 }}>{product.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: '#a855f7' }}>Rs {product.price.toLocaleString()}</span>
          {!outOfStock && (
            <button onClick={onAdd} disabled={inCart}
              style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: inCart ? 'default' : 'pointer', border: 'none', background: inCart ? 'rgba(36,30,66,.6)' : 'rgba(124,58,237,.25)', color: inCart ? '#6b5b9e' : '#c4b8e8', transition: 'all .2s' }}>
              {inCart ? <><i className="fas fa-check" style={{ marginRight: 4 }} />Added</> : <><i className="fas fa-cart-plus" style={{ marginRight: 4 }} />Add</>}
            </button>
          )}
        </div>
        <p style={{ color: product.stock > 0 ? '#4ade80' : '#f87171', fontSize: 12, marginTop: 10 }}>
          <i className={`fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: 5 }} />
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </div>
  )
}
