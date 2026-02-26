import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../services/api'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

function StatusBadge({ status }) {
  const map = {
    PENDING: { cls: 'status-pending', label: 'Pending' },
    CONFIRMED: { cls: 'status-confirmed', label: 'Confirmed' },
    SHIPPED: { cls: 'status-confirmed', label: 'Shipped' },
    DELIVERED: { cls: 'status-delivered', label: 'Delivered' },
    CANCELLED: { cls: 'status-cancelled', label: 'Cancelled' },
  }
  const { cls, label } = map[status?.toUpperCase()] ?? { cls: 'status-pending', label: status ?? 'Pending' }
  return <span className={`order-status ${cls}`}>{label}</span>
}

function StatusIcon({ status }) {
  const s = status?.toUpperCase()
  if (s === 'DELIVERED') return <span style={{ color: 'var(--green-500)', fontSize: 18 }}>✓</span>
  if (s === 'CANCELLED') return <span style={{ color: 'var(--red-500)', fontSize: 18 }}>✕</span>
  if (s === 'CONFIRMED' || s === 'SHIPPED') return <span style={{ color: 'var(--blue-500)', fontSize: 18 }}>⟳</span>
  return <span style={{ color: 'var(--yellow-500)', fontSize: 18 }}>◎</span>
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const displayId = order.orderId ?? order.id
  const displayTotal = order.totalAmount ?? order.total ?? 0
  const displayItems = order.products ?? order.items ?? []
  const displayDate = order.createdAt ?? order.orderDate
  const status = order.status ?? 'PENDING'
  const itemCount = displayItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
  const address = order.address

  return (
    <div className={`profile-order-card ${expanded ? 'expanded' : ''}`}>
      <button className="profile-order-summary" onClick={() => setExpanded(v => !v)}>
        <div className="profile-order-icon"><StatusIcon status={status} /></div>
        <div className="profile-order-meta">
          <div className="profile-order-id">Order <span className="font-mono">#{String(displayId).padStart(6, '0')}</span></div>
          <div className="profile-order-date">{fmtDate(displayDate)}</div>
        </div>
        <div className="profile-order-center">
          <div className="profile-order-items-preview">
            {displayItems.slice(0, 2).map((item, i) => (
              <span key={i} className="profile-order-item-chip">
                {item.product?.name ?? item.name ?? 'Item'}
                {(item.quantity ?? 1) > 1 && ` ×${item.quantity}`}
              </span>
            ))}
            {displayItems.length > 2 && (
              <span className="profile-order-item-chip more">+{displayItems.length - 2} more</span>
            )}
          </div>
        </div>
        <div className="profile-order-right">
          <StatusBadge status={status} />
          <div className="profile-order-total font-mono">₨{Number(displayTotal).toFixed(2)}</div>
        </div>
        <div className={`profile-order-chevron ${expanded ? 'up' : ''}`}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="profile-order-detail">
          {/* Items */}
          <div className="profile-order-detail-header">
            <div className="profile-order-detail-title">ORDER ITEMS</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
          </div>

          {displayItems.length > 0 ? (
            <div className="profile-order-items-list">
              {displayItems.map((item, idx) => {
                const name = item.product?.name ?? item.name ?? 'Product'
                const brand = item.product?.brand ?? item.brand
                const qty = item.quantity ?? 1
                const unit = item.product?.price ?? item.price ?? 0
                return (
                  <div key={idx} className="profile-order-item-row">
                    <div className="profile-order-item-dot" />
                    <div className="profile-order-item-details">
                      <span className="profile-order-item-name">{name}</span>
                      {brand && <span className="profile-order-item-sub">{brand}</span>}
                    </div>
                    <div className="profile-order-item-qty">×{qty}</div>
                    <div className="profile-order-item-price font-mono">₨{(unit * qty).toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--gray-400)', padding: '12px 0' }}>No item details available</p>
          )}

          {/* Delivery address */}
          {address && (
            <div className="order-delivery-box">
              <div className="order-delivery-title">📍 Delivered to</div>
              {address.label && <div className="order-delivery-badge">{address.label}</div>}
              <div className="order-delivery-text">
                {[address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          <div className="profile-order-detail-footer">
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Placed on</div>
              <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{fmtDateTime(displayDate)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Order Total</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--accent)', fontWeight: 700 }}>
                ₨{Number(displayTotal).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="profile-stat-pill">
      <div className="profile-stat-value">{value}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  )
}

const ALL_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']

export default function Profile() {
  const { user, saveAddress, deleteAddress } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchOrder, setSearchOrder] = useState('')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true); setError('')
    try { const res = await ordersAPI.getAll(); setOrders(res.data ?? []) }
    catch { setError('Could not load order history.') }
    finally { setLoading(false) }
  }

  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount ?? o.total ?? 0), 0)
  const delivered = orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length
  const pending = orders.filter(o => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(o.status?.toUpperCase())).length

  const visibleOrders = useMemo(() => {
    let list = [...orders]
    if (statusFilter !== 'ALL') list = list.filter(o => o.status?.toUpperCase() === statusFilter)
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase()
      list = list.filter(o => {
        const id = String(o.orderId ?? o.id ?? '')
        const names = (o.products ?? o.items ?? []).map(i => (i.product?.name ?? i.name ?? '').toLowerCase()).join(' ')
        return id.includes(q) || names.includes(q)
      })
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt ?? a.orderDate ?? 0)
      const db = new Date(b.createdAt ?? b.orderDate ?? 0)
      return sortDir === 'desc' ? db - da : da - db
    })
    return list
  }, [orders, statusFilter, searchOrder, sortDir])

  const addresses = user?.addresses ?? []

  return (
    <div className="page-content page-wrapper">
      <div className="page-header">
        <h1 className="page-title">PROFILE</h1>
        <p className="page-subtitle">Manage your account and order history</p>
      </div>

      <div className="profile-layout">
        {/* ══ Sidebar ══ */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div className="profile-name">{user?.name ?? 'User'}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-role" style={{ marginTop: 10 }}>
              <span className={`role-badge ${user?.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                {user?.role ?? 'USER'}
              </span>
            </div>

            <hr className="divider" />

            <div className="profile-info-row">
              <div className="profile-info-label">Full Name</div>
              <div className="profile-info-value">{user?.name ?? '—'}</div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-label">Email</div>
              <div className="profile-info-value" style={{ wordBreak: 'break-all', fontSize: 14 }}>{user?.email ?? '—'}</div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-label">Phone</div>
              <div className="profile-info-value">{user?.phone || '—'}</div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-label">Role</div>
              <div className="profile-info-value">{user?.role ?? 'USER'}</div>
            </div>
            <div className="profile-info-row" style={{ borderBottom: 'none' }}>
              <div className="profile-info-label">Member Since</div>
              <div className="profile-info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
              </div>
            </div>

            <hr className="divider" />

            {/* Saved Addresses */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 10 }}>
                Saved Addresses
              </div>
              {addresses.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No addresses saved. Add one during checkout.</p>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} className="profile-addr-chip">
                    <div>
                      {addr.label && <div className="profile-addr-label">{addr.label}</div>}
                      <div className="profile-addr-text">{addr.line1}, {addr.city}{addr.pincode ? ` - ${addr.pincode}` : ''}</div>
                    </div>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteAddress(addr.id)} title="Remove">
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            <hr className="divider" />

            <div className="profile-stats-row">
              <StatPill label="Orders" value={orders.length} />
              <StatPill label="Delivered" value={delivered} />
              <StatPill label="Pending" value={pending} />
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--gray-100)', marginTop: 4 }}>
              <div className="profile-info-label" style={{ marginBottom: 4 }}>Total Spent</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--accent)', fontWeight: 700 }}>
                ₨{totalSpent.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 10 }}>🛍️ Continue Shopping</Link>
            <Link to="/cart" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 10 }}>🛒 View Cart</Link>
          </div>
        </div>

        {/* ══ Order History ══ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>ORDER HISTORY</h2>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
              </svg>
              Refresh
            </button>
          </div>

          {!loading && orders.length > 0 && (
            <div className="order-history-toolbar">
              <div className="order-search-wrap">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input className="order-search-input" type="text" placeholder="Search orders…"
                  value={searchOrder} onChange={e => setSearchOrder(e.target.value)} />
                {searchOrder && <button className="order-search-clear" onClick={() => setSearchOrder('')}>✕</button>}
              </div>
              <div className="order-status-chips">
                {ALL_STATUSES.map(s => (
                  <button key={s} className={`order-status-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                    {s === 'ALL' ? `All (${orders.length})` : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M7 12h10M11 18h2" /></svg>
                {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : error ? (
            <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 24px' }}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">No Orders Yet</div>
              <div className="empty-body">Your order history will appear here once you make your first purchase.</div>
              <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No Matching Orders</div>
              <button className="btn btn-secondary" onClick={() => { setStatusFilter('ALL'); setSearchOrder('') }}>Clear Filters</button>
            </div>
          ) : (
            <div className="profile-orders-list">
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--gray-400)' }}>
                Showing {visibleOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                {(statusFilter !== 'ALL' || searchOrder) && ' (filtered)'}
              </div>
              {visibleOrders.map(order => <OrderCard key={order.id ?? order.orderId} order={order} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}