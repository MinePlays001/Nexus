import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/lib/supabase'

export const Route = createFileRoute('/admin/login')({ component: AdminLogin })

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('nv2_admin', '1')
      navigate({ to: '/admin/dashboard' })
    } else {
      setErr('Invalid credentials.')
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0814', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="page-enter">
        <div className="glow-border" style={{ borderRadius: 24, padding: 32, background: 'rgba(26,21,53,.5)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 28px rgba(147,51,234,.5)' }}>
            <i className="fas fa-shield-alt" style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <h2 style={{ fontFamily: 'Orbitron', fontSize: 18, color: '#fff', marginBottom: 6 }}>Admin Access</h2>
          <p style={{ color: '#6b5b9e', fontSize: 13, marginBottom: 24 }}>Restricted area — authorized only</p>

          {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 14, padding: '10px', borderRadius: 10, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)' }}>{err}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
              className="input-glow" required autoComplete="off" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="input-glow" required />
            <button type="submit" className="glow-btn" style={{ padding: '0.85rem', borderRadius: 12, color: '#fff', fontWeight: 700, marginTop: 6 }}>
              <i className="fas fa-lock" style={{ marginRight: 8 }} />Authenticate
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
