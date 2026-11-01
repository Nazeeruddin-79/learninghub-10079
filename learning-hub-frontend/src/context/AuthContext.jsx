import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

const AuthContext = createContext(null)

export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

export const TOKEN_KEY = 'lh-auth-token'

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status}).`)
  }

  return data || {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getAuthToken()) {
        if (active) setAuthLoading(false)
        return
      }

      try {
        const data = await apiRequest('/auth/me')
        if (active) setUser(data.user || null)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        if (active) setUser(null)
      } finally {
        if (active) setAuthLoading(false)
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({
    user,
    authLoading,

    async registerStudent({ name, email, password }) {
      try {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        })

        localStorage.setItem(TOKEN_KEY, data.token)
        setUser(data.user)

        return { success: true, user: data.user }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    async login({ email, password, role }) {
      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, role })
        })

        localStorage.setItem(TOKEN_KEY, data.token)
        setUser(data.user)

        return { success: true, user: data.user }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    logout() {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
  }), [user, authLoading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}