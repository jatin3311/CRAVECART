import { useState, useEffect, useMemo } from 'react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await productsAPI.getAll()
      setProducts(res.data ?? [])
    } catch (err) {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort()
  }, [products])

  // Unique brands
  const brands = useMemo(() => {
    return [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
  }, [products])

  // Filtering logic
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = !categoryFilter || p.category === categoryFilter
      const matchBrand = !brandFilter || p.brand === brandFilter
      return matchCat && matchBrand
    })
  }, [products, categoryFilter, brandFilter])

  const clearFilters = () => {
    setCategoryFilter('')
    setBrandFilter('')
  }

  const hasFilters = categoryFilter || brandFilter

  return (
    <div className="page-content">

      {/* HERO SECTION */}
      <div className="hero-bar">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-eyebrow">
            HI {user?.name || 'Guest'}
          </div>

          <h1 className="hero-title">
            WHAT ARE YOU <br />
            <em>CRAVING</em>
          </h1>

          <p className="hero-count" style={{ marginTop: 12 }}>
            {loading
              ? 'Loading products...'
              : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="filters-bar">
        <div className="container">
          <div className="filters-inner">

            <div className="filter-group">
              <span className="filter-label">Category</span>
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Brand</span>
              <select
                className="filter-select"
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <span
                className="filter-clear"
                onClick={clearFilters}
                title="Clear filters"
              >
                ✕ Clear filters
              </span>
            )}

          </div>
        </div>
      </div>

      {/* PRODUCT SECTION */}
      <div className="container">
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>

        ) : error ? (
          <div className="page-wrapper">
            <div className="alert alert-error">
              {error}
              <button
                className="btn btn-ghost btn-sm"
                onClick={fetchProducts}
                style={{ marginLeft: 'auto' }}
              >
                Retry
              </button>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {hasFilters ? '🔍' : '📦'}
            </div>

            <div className="empty-title">
              {hasFilters ? 'No Products Found' : 'No Products Yet'}
            </div>

            <div className="empty-body">
              {hasFilters
                ? 'Try adjusting your filters to find what you are looking for.'
                : 'Check back soon — new products are being added.'}
            </div>

            {hasFilters && (
              <button
                className="btn btn-secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}