/**
 * api.js — Axios instance for the Django REST Framework backend.
 *
 * Auth:    JWT SimpleJWT  →  Authorization: Bearer <access>
 * Tokens:  localStorage keys  'access'  and  'refresh'
 * Refresh: automatic 401 retry via /api/accounts/token/refresh/
 *          SimpleJWT rotates refresh tokens (ROTATE_REFRESH_TOKENS=True)
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token helpers ─────────────────────────────────────────────────────────────
export const setTokens = ({ access, refresh }) => {
  localStorage.setItem('access', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

export const clearTokens = () => {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('ethiodelala_user')
}

export const getAccessToken  = () => localStorage.getItem('access')
export const getRefreshToken = () => localStorage.getItem('refresh')

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

// ── Response interceptor — silent token refresh on 401 ───────────────────────
let isRefreshing   = false
let pendingQueue   = []   // { resolve, reject }[]

const flushQueue = (err, token) =>
  pendingQueue.splice(0).forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token)
  )

api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original = err.config

    if (
      err.response?.status === 401 &&
      !original._retry &&
      getRefreshToken()
    ) {
      if (isRefreshing) {
        // Queue until the in-flight refresh completes
        return new Promise((resolve, reject) =>
          pendingQueue.push({ resolve, reject })
        ).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing     = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/accounts/token/refresh/`,
          { refresh: getRefreshToken() }
        )
        setTokens({ access: data.access, refresh: data.refresh })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
        original.headers['Authorization']            = `Bearer ${data.access}`
        flushQueue(null, data.access)
        return api(original)
      } catch (refreshErr) {
        flushQueue(refreshErr, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

// ── DRF error parser — normalise any DRF error shape to a readable string ─────
export function parseDRFError(err) {
  const data = err?.response?.data
  if (!data) return err?.message || 'Network error. Please try again.'
  if (typeof data === 'string') return data
  if (data.detail)              return String(data.detail)
  if (data.non_field_errors)    return data.non_field_errors.join(' ')
  // { field: ['message'] } shape
  const firstKey = Object.keys(data)[0]
  if (!firstKey) return 'An unexpected error occurred.'
  const msg = data[firstKey]
  return `${firstKey}: ${Array.isArray(msg) ? msg[0] : msg}`
}

export default api
