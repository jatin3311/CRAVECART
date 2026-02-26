// ─── INTEGRATED WITH retail-ordering Spring Boot Backend ───────────────────
// Backend API base: http://localhost:8080/api
// Endpoints used:
//   POST /api/auth/register  { username, email, password, role }  → "User registered"
//   POST /api/auth/login     { username, password }               → JWT string (plain text)
//   GET  /api/menu                                                → List<Menu>
//   POST /api/menu           { name, brand, category, price, stock } (ADMIN) → Menu
//   POST /api/orders?menuId=&quantity=                            → Order object
// Cart is managed in local state (no cart endpoint in backend).
// ───────────────────────────────────────────────────────────────────────────
import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
// Backend returns plain text JWT string (not JSON). responseType: 'text' prevents JSON parse error.
export const authAPI = {
  // data: { username, password }
  login: (data) => api.post('/auth/login', data, { responseType: 'text' }),
  // data: { username, email, password, role }
  register: (data) => api.post('/auth/register', data, { responseType: 'text' }),
}

// ── Menu / Products ──────────────────────────────────────────────────────
export const menuAPI = {
  getAll: () => api.get('/menu'),
  // ADMIN only: { name, brand, category, packaging, price, stock }
  add: (data) => api.post('/menu', data),
}

// Alias so existing page components using productsAPI keep working
export const productsAPI = {
  getAll: () => menuAPI.getAll(),
  create: (data) => menuAPI.add(data),
  // Backend has no update/delete menu endpoints
  update: (_id, _data) => Promise.reject(new Error('Update not supported by this backend')),
  delete: (_id) => Promise.reject(new Error('Delete not supported by this backend')),
}

// ── Orders ────────────────────────────────────────────────────────────────
// Backend: POST /api/orders?menuId={id}&quantity={qty}
// Called once per cart item at checkout.
export const ordersAPI = {
  place: (menuId, quantity) => api.post(`/orders?menuId=${menuId}&quantity=${quantity}`),
}

export default api