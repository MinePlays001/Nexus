import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getProducts, getCategories, type Product, type Category } from '@/lib/db'
import { useAuth } from './__root'

export const Route = createFileRoute('/product/$id')({ component: ProductDetail })

function ProductDetail() {
  const { id } = Route.useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [cats, setCats] = useState<Category[]>([])
  const { cart, addToCart, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getProducts().then(ps => setProduct(ps.find(p => p.id === id) ?? null))
    getCategories().then(setCats)
  }, [id])

  if (!product) return <div style={{ paddingTop: 100, textAlign: 'center', color: '#6b5b9e' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const cat = cats.find(c => c.id === product.category_id)
  const inCart = !!cart.find(c => c.id === id)
  const outOfStock = product.stock <= 0

  const handleBuyNow = () => {
    if (!user) { navigate({ to: '/login' }); return }
    if (!inCart) addToCart({ id: product.id, title: product.title, price: product.price, stock: product.stock })
    navigate({ to: '/checkout' })
  }

  return (
    <main style={{ paddingTop: 64 }}>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }} className="page-enter">
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b5b9e', textDecoration: 'none', fontSize: 13, marginBottom: 28 }}>
          <i className="fas fa-arrow-left" />Back to Shop
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Image */}
          <div className="glow-border" style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
            <img src={product.image} alt={product.title} onError={(e) => (e.currentTarget.src = '/placeholder.png')}
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
            {!outOfStock && product.stock <= 5 && (
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(234,179,8,.15)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#facc15' }} className="stock-low">
                <i className="fas fa-fire" style={{ marginRight: 5 }} />Only {product.stock} left!
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8, background: 'rgba(147,51,234,.1)', border: '1px solid rgba(147,51,234,.25)', color: '#9b8ace', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
              {cat?.name ?? 'Digital'}
            </span>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>{product.title}</h1>
            <p style={{ color: '#9b8ace', lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>{product.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 38, fontWeight: 900, color: '#a855f7' }} className="glow-text">Rs {product.price.toLocaleString()}</span>
            </div>

            <p style={{ fontSize: 13, color: product.stock > 0 ? '#4ade80' : '#f87171', marginBottom: 28 }}>
              <i className={`fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`} style={{ marginRight: 6 }} />
              {product.stock > 0 ? `${product.stock} account${product.stock !== 1 ? 's' : ''} in stock` : 'Out of stock'}
            </p>

            {!user && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(147,51,234,.1)', border: '1px solid rgba(147,51,234,.25)', color: '#9b8ace', fontSize: 13 }}>
                <i className="fas fa-lock" style={{ marginRight: 8 }} />
                <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Login</Link> to purchase this account
              </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
              {outOfStock ? (
                <button disabled className="glow-btn" style={{ flex: 1, padding: '0.9rem', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, opacity: 0.5, cursor: 'not-allowed' }}>Out of Stock</button>
              ) : (
                <>
                  <button onClick={() => user ? addToCart({ id: product.id, title: product.title, price: product.price, stock: product.stock }) : navigate({ to: '/login' })}
                    disabled={inCart}
                    style={{ flex: 1, padding: '0.9rem', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: inCart ? 'default' : 'pointer', border: 'none', background: inCart ? 'rgba(36,30,66,.6)' : 'rgba(124,58,237,.25)', color: inCart ? '#6b5b9e' : '#c4b8e8', transition: 'all .2s' }}>
                    {inCart ? <><i className="fas fa-check" style={{ marginRight: 8 }} />In Cart</> : <><i className="fas fa-cart-plus" style={{ marginRight: 8 }} />Add to Cart</>}
                  </button>
                  <button onClick={handleBuyNow} className="glow-btn" style={{ flex: 1, padding: '0.9rem', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700 }}>
                    <i className="fas fa-bolt" style={{ marginRight: 8 }} />Buy Now
                  </button>
                </>
              )}
            </div>

            <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 12, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.2)', fontSize: 13, color: '#86efac' }}>
              <i className="fas fa-envelope" style={{ marginRight: 8 }} />After payment confirmation, account details will be sent to your email.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
