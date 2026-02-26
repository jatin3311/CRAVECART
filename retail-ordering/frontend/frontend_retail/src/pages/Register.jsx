import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'USER'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields.'); return
    }
    if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-\+]/g, ''))) {
      setError('Please enter a valid phone number.'); return
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role })
      addToast('Account created! Welcome to NEXUS.', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
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
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle" style={{ marginTop: 6 }}>Satisfy you cravings now!!!</div>
        </div>

        {error && <div className="alert alert-error mt-16">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="role-selector">
              <div className="role-option">
                <input type="radio" id="reg-role-user" name="role" value="USER"
                  checked={form.role === 'USER'} onChange={handleChange} />
                <label className="role-option-label" htmlFor="reg-role-user">
                  <span className="role-option-icon">🛍️</span>
                  <span className="role-option-text">
                    <span className="role-option-name">Shop</span>
                    <span className="role-option-desc">Customer account</span>
                  </span>
                </label>
              </div>
              <div className="role-option">
                <input type="radio" id="reg-role-admin" name="role" value="ADMIN"
                  checked={form.role === 'ADMIN'} onChange={handleChange} />
                <label className="role-option-label" htmlFor="reg-role-admin">
                  <span className="role-option-icon">⚙️</span>
                  <span className="role-option-text">
                    <span className="role-option-name">Manage</span>
                    <span className="role-option-desc">Admin account</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} autoComplete="name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" name="phone" placeholder="+91 98765 43210"
              value={form.phone} onChange={handleChange} autoComplete="tel" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating Account…' : `Create ${form.role === 'ADMIN' ? 'Admin' : 'Customer'} Account`}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--gray-400)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}