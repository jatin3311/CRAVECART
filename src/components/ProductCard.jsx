import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ===== CATEGORY THEME CONFIG ===== */
const CATEGORY_THEME = {
  Pizza: {
    emoji: '🍕',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
  },
  SoftDrink: {
    emoji: '🥤',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
  },
  Cakes: {
    emoji: '🎂',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
  },
  Burger: {
    emoji: '🍔',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
  },
  Bread: {
    emoji: '🍞',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
  Subway: {
    emoji: '🥪',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  default: {
    emoji: '📦',
    color: '#FF6D1F',
    bg: 'rgba(255,109,31,0.08)',
  },
}

function getCategoryTheme(category) {
  if (!category) return CATEGORY_THEME.default
  return CATEGORY_THEME[category] ?? CATEGORY_THEME.default
}

function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="product-card-stock stock-out">Out of Stock</span>
  if (stock <= 5)
    return <span className="product-card-stock stock-low">Only {stock} left</span>
  return <span className="product-card-stock stock-ok">{stock} in stock</span>
}

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const { id, name, brand, category, price, stock, stockQuantity } = product
  const availableStock = stock ?? stockQuantity ?? 0
  const isOutOfStock = availableStock === 0

  const theme = getCategoryTheme(category)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      await addToCart(id)
      addToast(`${name} added to cart`, 'success')
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="product-card fade-up">
      {isOutOfStock && (
        <div className="out-of-stock-overlay">Out of Stock</div>
      )}

      {/* CATEGORY IMAGE AREA */}
      <div
        className="product-card-image"
        style={{
          background: theme.bg,
          borderBottom: `2px solid ${theme.color}20`,
        }}
      >
        <span style={{ fontSize: 56 }}>{theme.emoji}</span>
      </div>

      <div className="product-card-body">
        <div className="product-card-meta">
          {category && (
            <span
              className="tag"
              style={{
                background: theme.bg,
                color: theme.color,
                border: `1px solid ${theme.color}30`,
              }}
            >
              {category}
            </span>
          )}

          {brand && <span className="tag tag-brand">{brand}</span>}
        </div>

        <div className="product-card-name">{name}</div>

        <StockBadge stock={availableStock} />

        <div
          className="product-card-price"
          style={{ color: theme.color }}
        >
          ₨{Number(price).toFixed(2)}
        </div>
      </div>

      <div className="product-card-footer">
        <button
          className="btn btn-sm w-full"
          style={{
            background: isOutOfStock ? undefined : theme.color,
            color: isOutOfStock ? undefined : '#fff',
          }}
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
        >
          {adding
            ? 'Adding…'
            : isOutOfStock
              ? 'Out of Stock'
              : '+ Add to Cart'}
        </button>
      </div>
    </div>
  )
}