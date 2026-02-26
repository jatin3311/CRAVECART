// ─── AdminDashboard.jsx — integrated with retail-ordering backend ──────────
// Backend supports:
//   GET  /api/menu        → list all items
//   POST /api/menu        → add a new item (ADMIN only)
// Update & Delete are NOT supported by this backend.
// ───────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { name: '', brand: '', category: '', price: '', stock: '', packaging: '' }

function StockBar({ stock, max = 100 }) {
  const pct = Math.min((stock / max) * 100, 100)
  const cls = stock === 0 ? 'low' : stock <= 10 ? 'medium' : 'high'
  return (
    <div className="stock-bar-wrap">
      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{stock}</div>
      <div className="stock-bar">
        <div className={`stock-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const { addToast } = useToast()

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsAPI.getAll()
      setProducts(res.data ?? [])
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Failed to load menu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name || !form.price || !form.stock) {
      setFormError('Name, price, and stock are required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        packaging: form.packaging,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      }
      const res = await productsAPI.create(payload)
      setProducts(prev => [...prev, res.data])
      setForm(EMPTY_FORM)
      addToast(`${payload.name} added to menu!`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message ?? err.message ?? 'Failed to add item', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const totalItems = products.length
  const inStock = products.filter(p => (p.stock ?? 0) > 0).length
  const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length

  return (
    <div className="page-content page-wrapper">
      <div className="page-header">
        <h1 className="page-title">ADMIN DASHBOARD</h1>
        <p className="page-subtitle">Manage menu items and inventory</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{totalItems}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Stock</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{inStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{outOfStock}</div>
        </div>
      </div>

      {/* Add Menu Item Form */}
      <div className="admin-card" style={{ marginBottom: 32 }}>
        <h2 className="section-title">Add Menu Item</h2>
        {formError && <div className="alert alert-error mb-16">{formError}</div>}
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" name="name" placeholder="e.g. Margherita Pizza" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input className="form-input" name="brand" placeholder="e.g. Dominos" value={form.brand} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" name="category" placeholder="e.g. Pizza" value={form.category} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Packaging</label>
            <input className="form-input" name="packaging" placeholder="e.g. Box" value={form.packaging} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Price * (₨)</label>
            <input className="form-input" name="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock *</label>
            <input className="form-input" name="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : '+ Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Menu Table */}
      <div className="admin-card">
        <h2 className="section-title">Menu Items ({totalItems})</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Note: Edit and delete operations are not supported by the current backend.
        </p>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">No items yet</div>
            <div className="empty-body">Use the form above to add your first menu item.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Brand</th><th>Category</th><th>Packaging</th><th>Price</th><th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.brand ?? '—'}</td>
                    <td>{p.category ?? '—'}</td>
                    <td>{p.packaging ?? '—'}</td>
                    <td className="font-mono">₨{Number(p.price).toFixed(2)}</td>
                    <td><StockBar stock={p.stock ?? 0} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}