import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCategories, getProducts, type Category, type Product } from '@/lib/db'
import { useAuth } from './__root'
import { ProductCard } from './index'

export const Route = createFileRoute('/shop')({
  validateSearch: (s: Record<string, unknown>) => ({ cat: s.cat as string | undefined }),
  component: Shop,
})

function Shop() {
  const { cat: initCat } = Route.useSearch()
  const [cats, setCats] = useState<Category[]>([])
  const [prods, setProds] = useState<Product[]>([])
  const [selCat, setSelCat] = useState<string | null>(initCat ?? null)
  const [q, setQ] = useState('')
  const { cart, addToCart } = useAuth()

  useEffect(() => {
    getCategories().then(setCats)
    getProducts().then(setProds)
  }, [])

  const filtered = prods.filter(p => {
    const matchCat = !selCat || p.category_id === selCat
    const matchQ = !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <main style={{ paddingTop: 64 }}>
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }} className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: '#fff' }}>
              {selCat ? cats.find(c => c.id === selCat)?.name ?? 'Shop' : 'All Accounts'}
            </h1>
            <p style={{ color: '#6b5b9e', fontSize: 13, marginTop: 5 }}>{filtered.length} account{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b5b9e', fontSize: 13 }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search accounts..."
              className="input-glow" style={{ paddingLeft: 36, width: 260 }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          <Pill label="All" active={!selCat} onClick={() => setSelCat(null)} />
          {cats.map(c => <Pill key={c.id} label={c.name} active={selCat === c.id} onClick={() => setSelCat(c.id)} />)}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <i className="fas fa-box-open" style={{ fontSize: 48, color: '#3d3468', marginBottom: 16 }} />
            <p style={{ color: '#6b5b9e', fontSize: 18 }}>No accounts found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24 }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} cat={cats.find(c => c.id === p.category_id)}
                inCart={!!cart.find(c => c.id === p.id)}
                onAdd={() => addToCart({ id: p.id, title: p.title, price: p.price, stock: p.stock })} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '0.45rem 1rem', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: active ? 'none' : '1px solid rgba(61,52,104,.5)', background: active ? '#7c3aed' : 'rgba(26,21,53,.5)', color: active ? '#fff' : '#9b8ace', transition: 'all .2s' }}>
      {label}
    </button>
  )
}
