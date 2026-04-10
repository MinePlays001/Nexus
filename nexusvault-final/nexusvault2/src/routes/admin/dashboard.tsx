import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  getCategories, getProducts, getOrders, getSettings,
  createCategory, editCategory, removeCategory,
  createProduct, editProduct, removeProduct,
  updateOrderStatus, updateSettings,
  type Category, type Product, type Order, type Settings
} from '@/lib/db'

export const Route = createFileRoute('/admin/dashboard')({ component: AdminDashboard })

function AdminDashboard() {
  const navigate = useNavigate()
  const [section, setSection] = useState('dashboard')
  const [cats, setCats] = useState<Category[]>([])
  const [prods, setProds] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('nv2_admin')) { navigate({ to: '/admin/login' }); return }
    getCategories().then(setCats)
    getProducts().then(setProds)
    getOrders().then(setOrders)
    getSettings().then(setSettings)
  }, [])

  const logout = () => { sessionStorage.removeItem('nv2_admin'); navigate({ to: '/' }) }

  const NAV = [
    { id: 'dashboard', icon: 'fa-chart-bar', label: 'Dashboard' },
    { id: 'orders', icon: 'fa-receipt', label: 'Orders' },
    { id: 'products', icon: 'fa-box', label: 'Products' },
    { id: 'categories', icon: 'fa-folder', label: 'Categories' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0814' }}>
      {/* Sidebar */}
      <aside style={{ width: 230, background: '#100d1e', borderRight: '1px solid rgba(147,51,234,.1)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(61,52,104,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(147,51,234,.4)' }}>
              <i className="fas fa-vault" style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#fff' }}>NexusVault</p>
              <p style={{ color: '#6b5b9e', fontSize: 11 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setSection(n.id)}
              className={`admin-link ${section === n.id ? 'active' : ''}`}
              style={{ background: section === n.id ? 'rgba(147,51,234,.1)' : 'transparent', color: section === n.id ? '#c4b8e8' : '#6b5b9e', marginBottom: 3 }}>
              <i className={`fas ${n.icon}`} style={{ width: 16, fontSize: 13 }} />{n.label}
              {n.id === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(61,52,104,.4)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 1rem', borderRadius: 10, color: '#6b5b9e', textDecoration: 'none', fontSize: 13, marginBottom: 4 }}>
            <i className="fas fa-globe" style={{ width: 16, fontSize: 13 }} />View Store
          </Link>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 1rem', borderRadius: 10, color: '#f87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <i className="fas fa-sign-out-alt" style={{ width: 16, fontSize: 13 }} />Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }} className="page-enter">
        {section === 'dashboard' && <DashSection prods={prods} cats={cats} orders={orders} />}
        {section === 'orders' && <OrdersSection orders={orders} setOrders={setOrders} prods={prods} setProds={setProds} />}
        {section === 'products' && <ProductsSection prods={prods} setProds={setProds} cats={cats} />}
        {section === 'categories' && <CatsSection cats={cats} setCats={setCats} prods={prods} />}
        {section === 'settings' && settings && <SettingsSection settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────
function DashSection({ prods, cats, orders }: { prods: Product[]; cats: Category[]; orders: Order[] }) {
  const revenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.status === 'pending').length
  const stats = [
    { label: 'Products', value: prods.length, icon: 'fa-box', color: '#a855f7' },
    { label: 'Categories', value: cats.length, icon: 'fa-folder', color: '#d946ef' },
    { label: 'Pending', value: pending, icon: 'fa-clock', color: '#facc15' },
    { label: 'Revenue', value: `Rs ${revenue.toLocaleString()}`, icon: 'fa-chart-line', color: '#4ade80' },
  ]
  return (
    <>
      <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#fff', marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="glow-border" style={{ borderRadius: 14, padding: 20, background: 'rgba(26,21,53,.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#6b5b9e', fontSize: 12 }}>{s.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(147,51,234,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 14 }} />
              </div>
            </div>
            <p style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: '#fff' }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="glow-border" style={{ borderRadius: 14, background: 'rgba(26,21,53,.35)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(61,52,104,.3)' }}>
          <p style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#9b8ace' }}>Recent Orders</p>
        </div>
        {orders.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center', color: '#6b5b9e' }}>No orders yet</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(61,52,104,.3)' }}>
              {['Order', 'Buyer', 'Total', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1.1rem', color: '#6b5b9e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.slice(0, 10).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(61,52,104,.2)' }}>
                  <td style={{ padding: '0.7rem 1.1rem', color: '#c4b8e8', fontSize: 12, fontFamily: 'monospace' }}>#{o.id.slice(0, 10)}</td>
                  <td style={{ padding: '0.7rem 1.1rem', color: '#9b8ace', fontSize: 13 }}>{o.buyer_email}</td>
                  <td style={{ padding: '0.7rem 1.1rem', fontFamily: 'Orbitron', color: '#a855f7', fontSize: 13, fontWeight: 700 }}>Rs {o.total.toLocaleString()}</td>
                  <td style={{ padding: '0.7rem 1.1rem' }}><span className={`badge-${o.status}`} style={{ padding: '3px 10px', borderRadius: 7, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{o.status}</span></td>
                  <td style={{ padding: '0.7rem 1.1rem', color: '#6b5b9e', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ─── Orders ───────────────────────────────────────────────────────
function OrdersSection({ orders, setOrders, prods, setProds }: { orders: Order[]; setOrders: (o: Order[]) => void; prods: Product[]; setProds: (p: Product[]) => void }) {
  const [modal, setModal] = useState<{ open: boolean; order?: Order; type?: 'paid' | 'rejected' }>({ open: false })
  const [info, setInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('all')

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const handleConfirm = async () => {
    if (!modal.order) return
    setSaving(true)
    const updates: Partial<Order> = { status: modal.type }
    if (modal.type === 'paid') {
      updates.account_details = info.trim() || 'Account details will be sent to your email shortly.'
    } else {
      updates.reject_reason = info.trim() || 'Payment could not be verified.'
    }
    await updateOrderStatus(modal.order.id, updates)
    setOrders(orders.map(o => o.id === modal.order!.id ? { ...o, ...updates } as Order : o))
    setSaving(false)
    setModal({ open: false })
    setInfo('')
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#fff' }}>Orders</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'pending', 'paid', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: filter === f ? 'none' : '1px solid rgba(61,52,104,.5)', background: filter === f ? '#7c3aed' : 'transparent', color: filter === f ? '#fff' : '#6b5b9e', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b5b9e', padding: '3rem' }}>No orders found</p>}
        {filtered.map(o => (
          <div key={o.id} className="glow-border" style={{ borderRadius: 14, padding: 20, background: 'rgba(26,21,53,.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ color: '#6b5b9e', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }}>#{o.id}</p>
                <p style={{ color: '#c4b8e8', fontSize: 14, fontWeight: 600 }}>{o.buyer_name}</p>
                <p style={{ color: '#6b5b9e', fontSize: 12 }}>{o.buyer_email}</p>
              </div>
              <span className={`badge-${o.status}`} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{o.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
              {o.items.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#9b8ace' }}>{i.title}</span>
                  <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700 }}>Rs {i.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, paddingTop: 12, borderTop: '1px solid rgba(61,52,104,.3)', marginBottom: o.status === 'pending' ? 14 : 0 }}>
              <span style={{ color: '#6b5b9e' }}>Txn: <span style={{ color: '#e2e0ef', fontFamily: 'monospace' }}>{o.transaction_id}</span></span>
              <span style={{ color: '#6b5b9e' }}>Total: <span style={{ fontFamily: 'Orbitron', color: '#a855f7', fontWeight: 700 }}>Rs {o.total.toLocaleString()}</span></span>
              <span style={{ color: '#6b5b9e' }}>Date: <span style={{ color: '#e2e0ef' }}>{new Date(o.created_at).toLocaleString()}</span></span>
            </div>

            {o.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setModal({ open: true, order: o, type: 'paid' }); setInfo('') }}
                  style={{ padding: '7px 18px', borderRadius: 10, background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <i className="fas fa-check" style={{ marginRight: 6 }} />Mark Paid
                </button>
                <button onClick={() => { setModal({ open: true, order: o, type: 'rejected' }); setInfo('') }}
                  style={{ padding: '7px 18px', borderRadius: 10, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <i className="fas fa-times" style={{ marginRight: 6 }} />Reject
                </button>
              </div>
            )}

            {o.account_details && (
              <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.2)' }}>
                <p style={{ color: '#4ade80', fontSize: 12, marginBottom: 6 }}>Account details sent:</p>
                <pre style={{ color: '#86efac', fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{o.account_details}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <Modal title={modal.type === 'paid' ? 'Confirm Payment' : 'Reject Order'} onClose={() => setModal({ open: false })}>
          <p style={{ color: '#9b8ace', fontSize: 13, marginBottom: 12 }}>
            {modal.type === 'paid'
              ? 'Enter account details to send to buyer (email + password, or any delivery info):'
              : 'Reason for rejection (shown to buyer):'}
          </p>
          <textarea value={info} onChange={e => setInfo(e.target.value)} rows={5}
            placeholder={modal.type === 'paid' ? 'Email: example@steam.com\nPassword: abc123\nNote: Change password after login.' : 'Payment not received / incorrect amount...'}
            className="input-glow" style={{ resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button onClick={() => setModal({ open: false })} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(61,52,104,.5)', background: 'transparent', color: '#6b5b9e', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleConfirm} disabled={saving}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, color: '#fff', background: modal.type === 'paid' ? '#16a34a' : '#dc2626' }}>
              {saving ? 'Saving...' : modal.type === 'paid' ? 'Confirm Paid' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Products ─────────────────────────────────────────────────────
function ProductsSection({ prods, setProds, cats }: { prods: Product[]; setProds: (p: Product[]) => void; cats: Category[] }) {
  const [modal, setModal] = useState<{ open: boolean; edit?: Product }>({ open: false })
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '', category_id: '', image: '' })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm({ title: '', description: '', price: '', stock: '', category_id: '', image: '' }); setModal({ open: true }) }
  const openEdit = (p: Product) => {
    setForm({ title: p.title, description: p.description, price: String(p.price), stock: String(p.stock), category_id: p.category_id, image: p.image })
    setModal({ open: true, edit: p })
  }

  const handleSave = async () => {
    if (!form.title || !form.price || !form.category_id) return
    setSaving(true)
    const data = { title: form.title, description: form.description, price: Number(form.price), stock: Number(form.stock) || 0, category_id: form.category_id, image: form.image }
    if (modal.edit) {
      await editProduct(modal.edit.id, data)
      setProds(prods.map(p => p.id === modal.edit!.id ? { ...p, ...data } : p))
    } else {
      const p = await createProduct(data)
      setProds([p, ...prods])
    }
    setSaving(false); setModal({ open: false })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await removeProduct(id); setProds(prods.filter(p => p.id !== id))
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#fff' }}>Products</h2>
        <button onClick={openAdd} className="glow-btn" style={{ padding: '7px 18px', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600 }}>
          <i className="fas fa-plus" style={{ marginRight: 7 }} />Add Product
        </button>
      </div>

      <div className="glow-border" style={{ borderRadius: 14, background: 'rgba(26,21,53,.35)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(61,52,104,.3)' }}>
            {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
              <th key={h} style={{ textAlign: h === 'Actions' ? 'right' : 'left', padding: '0.7rem 1rem', color: '#6b5b9e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {prods.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(61,52,104,.2)' }}>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={p.image} onError={(e) => (e.currentTarget.src = '/placeholder.png')} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <span style={{ color: '#e2e0ef', fontSize: 13, fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                </td>
                <td style={{ padding: '0.7rem 1rem', color: '#9b8ace', fontSize: 13 }}>{cats.find(c => c.id === p.category_id)?.name ?? '—'}</td>
                <td style={{ padding: '0.7rem 1rem', fontFamily: 'Orbitron', color: '#a855f7', fontSize: 13, fontWeight: 700 }}>Rs {p.price.toLocaleString()}</td>
                <td style={{ padding: '0.7rem 1rem' }}>
                  <span style={{ color: p.stock === 0 ? '#f87171' : p.stock <= 5 ? '#facc15' : '#4ade80', fontSize: 13, fontWeight: 600 }}>
                    {p.stock === 0 ? 'Out of stock' : p.stock}
                  </span>
                </td>
                <td style={{ padding: '0.7rem 1rem', textAlign: 'right' }}>
                  <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(36,30,66,.6)', border: 'none', color: '#9b8ace', cursor: 'pointer', marginRight: 6 }}>
                    <i className="fas fa-edit" style={{ fontSize: 12 }} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(36,30,66,.6)', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <i className="fas fa-trash-alt" style={{ fontSize: 12 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <Modal title={modal.edit ? 'Edit Product' : 'Add Product'} onClose={() => setModal({ open: false })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.title} onChange={f('title')} placeholder="Product title" className="input-glow" />
            <textarea value={form.description} onChange={f('description')} placeholder="Description" rows={3}
              className="input-glow" style={{ resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input value={form.price} onChange={f('price')} placeholder="Price (Rs)" type="number" className="input-glow" />
              <input value={form.stock} onChange={f('stock')} placeholder="Stock qty" type="number" min="0" className="input-glow" />
            </div>
            <select value={form.category_id} onChange={f('category_id')} className="input-glow">
              <option value="">Select category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.image} onChange={f('image')} placeholder="Image URL (https://...)" className="input-glow" />
            {form.image && <img src={form.image} onError={(e) => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button onClick={() => setModal({ open: false })} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(61,52,104,.5)', background: 'transparent', color: '#6b5b9e', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="glow-btn" style={{ padding: '8px 20px', borderRadius: 10, color: '#fff', fontWeight: 600 }}>
              {saving ? 'Saving...' : modal.edit ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Categories ───────────────────────────────────────────────────
function CatsSection({ cats, setCats, prods }: { cats: Category[]; setCats: (c: Category[]) => void; prods: Product[] }) {
  const [modal, setModal] = useState<{ open: boolean; edit?: Category }>({ open: false })
  const [form, setForm] = useState({ name: '', image: '' })
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm({ name: '', image: '' }); setModal({ open: true }) }
  const openEdit = (c: Category) => { setForm({ name: c.name, image: c.image }); setModal({ open: true, edit: c }) }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    if (modal.edit) {
      await editCategory(modal.edit.id, form)
      setCats(cats.map(c => c.id === modal.edit!.id ? { ...c, ...form } : c))
    } else {
      const c = await createCategory(form)
      setCats([c, ...cats])
    }
    setSaving(false); setModal({ open: false })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await removeCategory(id); setCats(cats.filter(c => c.id !== id))
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#fff' }}>Categories</h2>
        <button onClick={openAdd} className="glow-btn" style={{ padding: '7px 18px', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600 }}>
          <i className="fas fa-plus" style={{ marginRight: 7 }} />Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 16 }}>
        {cats.map(c => (
          <div key={c.id} className="glow-border" style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(26,21,53,.35)' }}>
            <div style={{ position: 'relative', paddingBottom: '58%' }}>
              <img src={c.image} onError={(e) => (e.currentTarget.src = '/placeholder.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Orbitron', color: '#fff', fontSize: 13 }}>{c.name}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(c)} style={{ padding: '5px 9px', borderRadius: 7, background: 'rgba(36,30,66,.6)', border: 'none', color: '#9b8ace', cursor: 'pointer' }}><i className="fas fa-edit" style={{ fontSize: 11 }} /></button>
                <button onClick={() => handleDelete(c.id)} style={{ padding: '5px 9px', borderRadius: 7, background: 'rgba(36,30,66,.6)', border: 'none', color: '#f87171', cursor: 'pointer' }}><i className="fas fa-trash-alt" style={{ fontSize: 11 }} /></button>
              </div>
            </div>
            <p style={{ padding: '0 14px 12px', color: '#6b5b9e', fontSize: 11 }}>{prods.filter(p => p.category_id === c.id).length} products</p>
          </div>
        ))}
      </div>

      {modal.open && (
        <Modal title={modal.edit ? 'Edit Category' : 'Add Category'} onClose={() => setModal({ open: false })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Category name" className="input-glow" />
            <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Image URL (https://...)" className="input-glow" />
            {form.image && <img src={form.image} onError={(e) => (e.currentTarget.style.display = 'none')} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button onClick={() => setModal({ open: false })} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid rgba(61,52,104,.5)', background: 'transparent', color: '#6b5b9e', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="glow-btn" style={{ padding: '8px 20px', borderRadius: 10, color: '#fff', fontWeight: 600 }}>
              {saving ? 'Saving...' : modal.edit ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Settings ─────────────────────────────────────────────────────
function SettingsSection({ settings, setSettings }: { settings: Settings; setSettings: (s: Settings) => void }) {
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const f = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await updateSettings(form); setSettings(form)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#fff', marginBottom: 24 }}>Settings</h2>
      <form onSubmit={handleSave} style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card title="Site Info">
          {[
            { label: 'Site Name', key: 'site_name' as keyof Settings },
            { label: 'Banner Title', key: 'banner_title' as keyof Settings },
            { label: 'Banner Subtitle', key: 'banner_subtitle' as keyof Settings },
          ].map(({ label, key }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: '#9b8ace', fontSize: 12, marginBottom: 7 }}>{label}</label>
              <input value={form[key]} onChange={f(key)} className="input-glow" />
            </div>
          ))}
        </Card>

        <Card title="JazzCash Payment Details">
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#9b8ace', fontSize: 12, marginBottom: 7 }}>JazzCash Number</label>
            <input value={form.jazzcash_number} onChange={f('jazzcash_number')} className="input-glow" placeholder="03238581603" />
          </div>
          <div>
            <label style={{ display: 'block', color: '#9b8ace', fontSize: 12, marginBottom: 7 }}>Account Name</label>
            <input value={form.jazzcash_name} onChange={f('jazzcash_name')} className="input-glow" placeholder="Shamim Akhtar" />
          </div>
        </Card>

        <button type="submit" disabled={saving} className="glow-btn" style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15 }}>
          {saved ? <><i className="fas fa-check" style={{ marginRight: 8 }} />Saved!</> : saving ? 'Saving...' : <><i className="fas fa-save" style={{ marginRight: 8 }} />Save Settings</>}
        </button>
      </form>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glow-border" style={{ borderRadius: 14, padding: 22, background: 'rgba(26,21,53,.35)' }}>
      <p style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#9b8ace', marginBottom: 18 }}>{title}</p>
      {children}
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1a1535', border: '1px solid rgba(147,51,234,.25)', borderRadius: 20, width: '100%', maxWidth: 500, padding: 26, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontFamily: 'Orbitron', color: '#9b8ace', fontSize: 15 }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b5b9e', cursor: 'pointer', fontSize: 18 }}><i className="fas fa-times" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
