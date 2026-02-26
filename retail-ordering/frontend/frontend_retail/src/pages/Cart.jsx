// ─── Cart.jsx — integrated with retail-ordering backend ───────────────────
// Checkout calls CartContext.checkout() which posts one order per item to
// POST /api/orders?menuId={id}&quantity={qty}
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const FOOD_EMOJI = { Pizza: '🍕', Burger: '🍔', Cakes: '🎂', SoftDrink: '🥤', Bread: '🍞', Subway: '🥪' }
function foodIcon(category) {
  if (!category) return '🍽️'
  const key = Object.keys(FOOD_EMOJI).find(k => category.toLowerCase().includes(k.toLowerCase()))
  return key ? FOOD_EMOJI[key] : '🍽️'
}

function CartItemRow({ item, onUpdate, onRemove }) {
  const name = item.name ?? 'Product'
  const price = item.price ?? 0
  const brand = item.brand
  const category = item.category
  const [updating, setUpdating] = useState(false)

  const handleQty = async (newQty) => {
    if (newQty < 1) return
    setUpdating(true)
    try { onUpdate(item.id, newQty) } finally { setUpdating(false) }
  }

  return (
    <div className="cart-item">
      <div className="cart-item-icon">{foodIcon(category)}</div>

      <div className="cart-item-info">
        <div className="cart-item-name">{name}</div>
        <div className="cart-item-meta">
          {brand && <span>{brand}</span>}
          {brand && category && <span> · </span>}
          {category && <span>{category}</span>}
        </div>
        <div className="cart-item-price" style={{ marginTop: 4 }}>
          ₨{(price * item.quantity).toFixed(2)}
          {item.quantity > 1 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>
              (₨{price.toFixed(2)} each)
            </span>
          )}
        </div>
      </div>

      <div className="qty-controls">
        <button className="qty-btn" onClick={() => handleQty(item.quantity - 1)} disabled={updating || item.quantity <= 1}>−</button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={() => handleQty(item.quantity + 1)} disabled={updating}>+</button>
      </div>

      <button className="btn btn-danger btn-sm btn-icon" onClick={() => onRemove(item.id)} title="Remove">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  )
}

export default function Cart() {
  const { cart, updateQty, removeItem, clearCart, checkout, totalAmount } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    setPlacing(true)
    try {
      await checkout()   // posts one order per cart item to backend
      addToast('Order placed successfully!', 'success')
      navigate('/profile')
    } catch (err) {
      addToast(err.response?.data?.message ?? err.message ?? 'Failed to place order.', 'error')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="page-content page-wrapper">
      <div className="page-header">
        <h1 className="page-title">CART</h1>
        <p className="page-subtitle">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <div className="empty-title">Your Cart is Empty</div>
          <div className="empty-body">Looks like you haven't added anything yet. Head to the menu to browse.</div>
          <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div className="flex flex-col gap-12">
            {cart.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdate={updateQty}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="order-summary">
            <div className="summary-title">ORDER SUMMARY</div>

            {cart.map(item => (
              <div key={item.id} className="summary-line">
                <span className="truncate" style={{ maxWidth: 160 }}>{item.name} ×{item.quantity}</span>
                <span className="font-mono">₨{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="summary-total" style={{ marginTop: 16 }}>
              <span className="summary-total-label">Total</span>
              <span className="summary-total-amount">₨{totalAmount.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 24 }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Placing Orders…' : '⚡ Place Order'}
            </button>

            <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 10 }} onClick={clearCart}>
              🗑 Clear Cart
            </button>

            <Link to="/menu" className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 6 }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}