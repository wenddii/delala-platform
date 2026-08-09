import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { setTokens, clearTokens, getAccessToken, parseDRFError } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  // Start loading=true so the session-restore effect can run before rendering
  const [loading, setLoading] = useState(true)

  // ── Fetch /api/accounts/profile/ and store result in state ─────────────────
  const fetchProfile = useCallback(async () => {
    const { data } = await api.get('/api/accounts/profile/')
    // Normalise field names so the rest of the app can use user.name, user.phone, etc.
    const normalised = {
      ...data,
      // Convenience aliases consumed throughout the UI
      name:         data.full_name || data.name || '',
      phone:        data.phone_number || data.phone || '',
      // role is not a backend field yet — default to 'buyer'; persisted in
      // localStorage so switchRole() survives a refresh.
      role:         data.role || localStorage.getItem('ethiodelala_role') || 'buyer',
    }
    setUser(normalised)
    return normalised
  }, [])

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }
      try {
        await fetchProfile()
      } catch (_) {
        // Token invalid / expired and refresh also failed → api.js already
        // called clearTokens() and redirected to /login. Just clear state here.
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [fetchProfile])

  // ── login(phoneNumber, password) ────────────────────────────────────────────
  const login = useCallback(async (phoneNumber, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/accounts/login/', {
        phone_number: phoneNumber,
        password,
      })
      setTokens({ access: data.access, refresh: data.refresh })
      const profile = await fetchProfile()
      return profile
    } catch (err) {
      throw new Error(parseDRFError(err))
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  // ── register(fullName, email, phoneNumber, password) ───────────────────────
  // NOTE: The backend schema has no "role" field. Role assignment is not
  //       supported by the backend yet — we store it client-side only.
  //       The caller may pass a 5th "role" argument from the old API; we
  //       silently ignore it here.
  const register = useCallback(async (fullName, email, phoneNumber, password) => {
    setLoading(true)
    try {
      // Build body — omit email entirely if blank (backend treats it as optional)
      const body = {
        full_name:    fullName,
        phone_number: phoneNumber,
        password,
      }
      if (email && email.trim()) body.email = email.trim()

      await api.post('/api/accounts/register/', body)

      // Auto-login after successful registration
      const { data } = await api.post('/api/accounts/login/', {
        phone_number: phoneNumber,
        password,
      })
      setTokens({ access: data.access, refresh: data.refresh })
      const profile = await fetchProfile()
      return profile
    } catch (err) {
      throw new Error(parseDRFError(err))
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  // ── updateProfile(profileData) ──────────────────────────────────────────────
  // PATCHes /api/accounts/profile/ with whatever fields the caller provides.
  // The backend field shape is not yet fully confirmed; the caller (EditProfile)
  // sends { name, full_name, email, phone, avatarUrl } — we map to DRF names.
  const updateProfile = useCallback(async (profileData) => {
    if (!user) throw new Error('Not authenticated.')
    setLoading(true)
    try {
      // Map UI names → backend field names
      const body = {}
      if (profileData.full_name !== undefined) body.full_name    = profileData.full_name
      if (profileData.name      !== undefined) body.full_name    = profileData.name      // alias
      if (profileData.email     !== undefined) body.email        = profileData.email
      if (profileData.phone     !== undefined) body.phone_number = profileData.phone
      if (profileData.phone_number !== undefined) body.phone_number = profileData.phone_number
      // avatarUrl: backend stores image_url (URLField) — send if present
      if (profileData.avatarUrl !== undefined) body.avatar_url  = profileData.avatarUrl

      const { data } = await api.patch('/api/accounts/profile/', body)
      const updated = {
        ...data,
        name:  data.full_name || data.name || '',
        phone: data.phone_number || data.phone || '',
        role:  user.role, // preserve client-side role
      }
      setUser(updated)
      return updated
    } catch (err) {
      throw new Error(parseDRFError(err))
    } finally {
      setLoading(false)
    }
  }, [user])

  // ── submitVerification() ────────────────────────────────────────────────────
  // TODO: No backend endpoint exists yet for identity verification.
  //       This remains a client-side mock until the backend team adds
  //       POST /api/accounts/verification/ or similar.
  const submitVerification = useCallback(async ({ idFile, faceFile } = {}) => {
    if (!user) throw new Error('Not authenticated.')
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1000))
    const updated = { ...user, idVerified: true, phone_verified: true }
    setUser(updated)
    return updated
  }, [user])

  // ── switchRole(newRole) — client-side only ─────────────────────────────────
  // The backend has no role field yet. We store the chosen role in localStorage
  // so it survives a page refresh.
  const switchRole = useCallback((newRole) => {
    if (!user) return
    localStorage.setItem('ethiodelala_role', newRole)
    setUser(prev => ({ ...prev, role: newRole }))
  }, [user])

  // ── logout() ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens()
    localStorage.removeItem('ethiodelala_role')
    setUser(null)
  }, [])

  // isSeller / isBuyer derived from client-side role (backend doesn't expose it yet)
  const isSeller = user?.role === 'seller' || user?.role === 'owner'
  const isBuyer  = !isSeller

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isSeller,
      isBuyer,
      loading,
      login,
      register,
      updateProfile,
      submitVerification,
      switchRole,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
