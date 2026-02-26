// ─── AuthContext — integrated with retail-ordering backend ─────────────────
// Backend login/register returns a plain JWT string (not JSON).
// JWT payload contains only `sub` (username) — no email/role inside token.
// We store the token + a user object built from registration data.
// ───────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

/** Decode JWT payload without a library (base64url → JSON). */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { }
    }
    setLoading(false)
  }, [])

  /**
   * Login — sends { username, password } to backend.
   * Frontend Login form collects email; we use email as username because
   * users typically register with their email as username.
   */
  const login = useCallback(async (credentials) => {
    // credentials from Login form: { email, password, role }
    // Backend LoginRequest expects: { username, password }
    const payload = { username: credentials.email, password: credentials.password }
    const res = await authAPI.login(payload)
    const token = typeof res.data === 'string' ? res.data.trim() : res.data

    // Decode JWT to get username; role isn't in token so use the selected role
    const claims = decodeJwt(token)
    const userData = {
      id: null,
      name: claims?.sub ?? credentials.email,
      email: credentials.email,
      username: claims?.sub ?? credentials.email,
      role: credentials.role ?? 'USER',
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  /**
   * Register — sends { username, email, password, role } to backend.
   * Backend returns "User registered" (plain string), then we auto-login.
   */
  const register = useCallback(async (data) => {
    // data from Register form: { name, email, password, role }
    // Backend User entity expects: { username, email, password, role }
    const payload = {
      username: data.email,   // use email as username
      email: data.email,
      password: data.password,
      role: data.role ?? 'USER',
    }
    await authAPI.register(payload)   // returns "User registered"

    // Auto-login after registration
    return login({ email: data.email, password: data.password, role: data.role })
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      isAdmin: user?.role === 'ADMIN',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)