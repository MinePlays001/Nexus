import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn, signUp } from '@/lib/db'
import { useAuth } from './__root'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const u = await signIn(form.email, form.password)
      setUser(u as any); navigate({ to: '/shop' })
    } catch { setErr('Invalid email or password.') }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); 
    if (form.password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setErr('Passwords do not match.'); return }
    setLoading(true)
    try {
      const u = await signUp(form.email, form.password, form.name)
      setUser(u as any); navigate({ to: '/shop' })
    } catch (e: any) { setErr(e.message ?? 'Signup failed.') }
    setLoading(false)
  }

  return (
    <main style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '90px 1rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="page-enter">
        <div className="glow-border" style={{ borderRadius: 24, padding: 32, background: 'rgba(26,21,53,0.5)' }}>
          {/* Icon */}
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 28px rgba(147,51,234,.5)' }}>
            <i className="fas fa-vault" style={{ color: '#fff', fontSize: 28 }} />
          </div>
          <h2 style={{ fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#6b5b9e', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {tab === 'login' ? 'Sign in to purchase accounts' : 'Join NexusVault to start buying'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, padding: 5, background: 'rgba(10,8,20,.6)', borderRadius: 12, marginBottom: 24 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: tab === t ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'transparent', color: tab === t ? '#fff' : '#6b5b9e', transition: 'all .2s' }}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}><i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />{err}</p>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email" type="email" value={form.email} onChange={f('email')} placeholder="you@email.com" />
              <Field label="Password" type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
              <Btn loading={loading} label="Sign In" />
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Full Name" type="text" value={form.name} onChange={f('name')} placeholder="John Doe" />
              <Field label="Email" type="email" value={form.email} onChange={f('email')} placeholder="you@email.com" />
              <Field label="Password (min 8 chars)" type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
              <Field label="Confirm Password" type="password" value={form.confirm} onChange={f('confirm')} placeholder="••••••••" />
              <Btn loading={loading} label="Create Account" />
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#6b5b9e', fontSize: 12, marginTop: 16 }}>
            {tab === 'login' ? 'No account? ' : 'Have an account? '}
            <button onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setErr('') }}
              style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {tab === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: 'block', color: '#9b8ace', fontSize: 12, fontWeight: 500, marginBottom: 7 }}>{label}</label>
      <input {...props} required className="input-glow" />
    </div>
  )
}

function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '0.85rem', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, marginTop: 4 }}>
      {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, display: 'inline-block' }} /> : label}
    </button>
  )
}
