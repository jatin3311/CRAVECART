import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          CRAVE<span>CART</span>
        </Link>

        {/* Nav links */}
        <div className="navbar-nav">
          <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Shop
          </NavLink>

          <NavLink to="/menu" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Menu
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/cart" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <div className="cart-badge-wrap">
                  Cart
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </div>
              </NavLink>

              <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Profile
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <span className="admin-badge">Admin</span>
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
