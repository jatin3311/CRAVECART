import { useState, useEffect, useMemo } from 'react'
import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

// ── helpers ─────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  Pizza: { emoji: '🍕', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  SoftDrink: { emoji: '🥤', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  Cakes: { emoji: '🎂', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  Burger: { emoji: '🍔', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  Bread: { emoji: '🍞', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  Subway: { emoji: '🥪', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
}
function getCatMeta(cat) {
  if (!cat) return CATEGORY_META.default
  const key = cat.toLowerCase()
  return Object.entries(CATEGORY_META).find(([k]) => key.includes(k))?.[1] ?? CATEGORY_META.default
}

// ── Product mini-card ────────────────────────────────────────────────────────
function MenuProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const stock = product.stock ?? product.stockQuantity ?? 0
  const outOfStock = stock === 0
  const meta = getCatMeta(product.category)

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product)
      addToast(`${product.name} added to cart`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="menu-product-card" style={{ '--cat-color': meta.color }}>
      <div className="menu-product-icon" style={{ background: meta.bg }}>
        <span>{meta.emoji}</span>
        {outOfStock && <div className="menu-oos-dot" />}
      </div>
      <div className="menu-product-info">
        <div className="menu-product-name">{product.name}</div>
        {product.brand && <div className="menu-product-brand">{product.brand}</div>}
        <div className="menu-product-bottom">
          <span className="menu-product-price">₨{Number(product.price).toFixed(2)}</span>
          <span className={`menu-stock-text ${outOfStock ? 'oos' : stock <= 5 ? 'low' : 'ok'}`}>
            {outOfStock ? 'Out of stock' : stock <= 5 ? `${stock} left` : `${stock} in stock`}
          </span>
        </div>
      </div>
      <button
        className="menu-add-btn"
        onClick={handleAdd}
        disabled={outOfStock || adding}
        title={outOfStock ? 'Out of stock' : 'Add to cart'}
      >
        {adding ? (
          <span className="menu-add-spinner" />
        ) : outOfStock ? (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
    </div>
  )
}

// ── Category section ─────────────────────────────────────────────────────────
function CategorySection({ category, products, isActive, onToggle }) {
  const meta = getCatMeta(category)
  const inStock = products.filter(p => (p.stock ?? p.stockQuantity ?? 0) > 0).length
  const outOfStock = products.length - inStock

  return (
    <div className={`cat-section ${isActive ? 'open' : ''}`} style={{ '--cat-color': meta.color, '--cat-bg': meta.bg }}>
      <button className="cat-section-header" onClick={onToggle}>
        <div className="cat-header-left">
          <div className="cat-emoji-wrap">
            <span className="cat-emoji">{meta.emoji}</span>
          </div>
          <div>
            <div className="cat-name">{category}</div>
            <div className="cat-counts">
              <span className="cat-count-total">{products.length} products</span>
              {outOfStock > 0 && <span className="cat-count-oos"> · {outOfStock} out of stock</span>}
            </div>
          </div>
        </div>
        <div className="cat-header-right">
          <div className="cat-pill">{inStock} available</div>
          <div className={`cat-chevron ${isActive ? 'up' : ''}`}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </button>

      {isActive && (
        <div className="cat-products">
          {products.map(p => <MenuProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Menu page ────────────────────────────────────────────────────────────
export default function Menu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategories, setActiveCategories] = useState(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await productsAPI.getAll()
      const data = res.data ?? []
      setProducts(data)
      // Open all categories by default
      const cats = [...new Set(data.map(p => p.category).filter(Boolean))]
      setActiveCategories(new Set(cats))
    } catch {
      setError('Failed to load menu. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Group products by category
  const grouped = useMemo(() => {
    const filtered = products.filter(p => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    })

    const map = {}
    filtered.forEach(p => {
      const cat = p.category || 'Uncategorized'
      if (!map[cat]) map[cat] = []
      map[cat].push(p)
    })
    return map
  }, [products, search])

  const categories = Object.keys(grouped).sort()
  const totalProducts = Object.values(grouped).flat().length

  const toggleCategory = (cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const expandAll = () => setActiveCategories(new Set(categories))
  const collapseAll = () => setActiveCategories(new Set())

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Page Header */}
      <div className="menu-hero">
        <div className="menu-hero-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '48px 24px 40px' }}>
          <div className="menu-hero-eyebrow">BROWSE BY CATEGORY</div>
          <h1 className="menu-hero-title">PRODUCT<br /><em>MENU</em></h1>
          <p className="menu-hero-sub">
            {loading ? '…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} across ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
          </p>

          {/* Search */}
          <div className="menu-search-wrap">
            <div className="menu-search-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              className="menu-search"
              type="text"
              placeholder="Search products, brands, categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="menu-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Category Quick-Nav */}
      {!loading && categories.length > 0 && !search && (
        <div className="cat-quicknav">
          <div className="container">
            <div className="cat-quicknav-inner">
              <div className="cat-quicknav-chips">
                {categories.map(cat => {
                  const meta = getCatMeta(cat)
                  return (
                    <button
                      key={cat}
                      className={`cat-chip ${activeCategories.has(cat) ? 'active' : ''}`}
                      onClick={() => toggleCategory(cat)}
                      style={{ '--cat-color': meta.color }}
                    >
                      {meta.emoji} {cat}
                    </button>
                  )
                })}
              </div>
              <div className="cat-quicknav-actions">
                <button className="btn btn-ghost btn-sm" onClick={expandAll}>Expand All</button>
                <button className="btn btn-ghost btn-sm" onClick={collapseAll}>Collapse All</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container" style={{ padding: '32px 24px 64px' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div className="alert alert-error">
            {error}
            <button className="btn btn-ghost btn-sm" onClick={fetchProducts} style={{ marginLeft: 'auto' }}>Retry</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{search ? '🔍' : '📦'}</div>
            <div className="empty-title">{search ? 'No Results' : 'No Products Yet'}</div>
            <div className="empty-body">
              {search ? `No products match "${search}". Try a different search term.` : 'Check back soon.'}
            </div>
            {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear Search</button>}
          </div>
        ) : (
          <div className="cat-sections">
            {categories.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                products={grouped[cat]}
                isActive={activeCategories.has(cat) || !!search}
                onToggle={() => toggleCategory(cat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}