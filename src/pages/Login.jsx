import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '', role: 'USER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const user = await login({ email: form.email, password: form.password, role: form.role })
      addToast(`Welcome back, ${user.name || 'there'}!`, 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="auth-card">
        <div className="auth-logo">CRAVE<span>CART</span></div>

        <div style={{ marginTop: 20 }}>
          <div className="auth-title">Welcome Back</div>
          <div className="auth-subtitle" style={{ marginTop: 6 }}>
            Sign in to access your account and orders
          </div>
        </div>

        {error && <div className="alert alert-error mt-16">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">Sign in as</label>
            <div className="role-selector">
              <div className="role-option">
                <input
                  type="radio"
                  id="role-user"
                  name="role"
                  value="USER"
                  checked={form.role === 'USER'}
                  onChange={handleChange}
                />
                <label className="role-option-label" htmlFor="role-user">
                  <span className="role-option-icon">🛍️</span>
                  <span className="role-option-text">
                    <span className="role-option-name">Customer</span>
                    <span className="role-option-desc">Browse & order</span>
                  </span>
                </label>
              </div>
              <div className="role-option">
                <input
                  type="radio"
                  id="role-admin"
                  name="role"
                  value="ADMIN"
                  checked={form.role === 'ADMIN'}
                  onChange={handleChange}
                />
                <label className="role-option-label" htmlFor="role-admin">
                  <span className="role-option-icon">⚙️</span>
                  <span className="role-option-text">
                    <span className="role-option-name">Admin</span>
                    <span className="role-option-desc">Manage store</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : `Sign in as ${form.role === 'ADMIN' ? 'Admin' : 'Customer'}`}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--gray-400)' }}>
          New here?{' '}
          <Link to="/register" className="auth-link">Create an account</Link>
        </p>
      </div>
    </div>
  )
}