// ─── CartContext — integrated with retail-ordering backend ─────────────────
// The backend has NO cart endpoints. Cart lives entirely in React state.
// On checkout, each cart item is submitted via POST /api/orders?menuId=&quantity=
// ───────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'
import { ordersAPI } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])   // [{ id, name, brand, category, price, stock, quantity }]
  const [loading] = useState(false)

  /** Add item to local cart (or increment qty if already present). */
  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }, [])

  /** Update quantity of a specific item (by product id). */
  const updateQty = useCallback((itemId, quantity) => {
    if (quantity < 1) return
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i))
  }, [])

  /** Remove item from cart by product id. */
  const removeItem = useCallback((itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }, [])

  /** Clear entire cart. */
  const clearCart = useCallback(() => setCart([]), [])

  /**
   * Checkout: place one order per cart item via backend POST /api/orders.
   * Returns array of Order objects from backend.
   * Throws if any order fails.
   */
  const checkout = useCallback(async () => {
    if (cart.length === 0) throw new Error('Cart is empty')
    const results = []
    for (const item of cart) {
      const res = await ordersAPI.place(item.id, item.quantity)
      results.push(res.data)
    }
    setCart([])
    return results
  }, [cart])

  const itemCount = cart.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
  const totalAmount = cart.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0)

  return (
    <CartContext.Provider value={{
      cart, loading,
      addToCart, updateQty, removeItem, clearCart, checkout,
      itemCount, totalAmount,
      // compat shims for components using the old cartAPI-based names
      fetchCart: () => { },
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)