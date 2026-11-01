import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lh-demo-user')) || null
    } catch {
      return null
    }
  })

  const value = useMemo(() => ({
    user,
    demoLogin(role) {
      const demoUser = {
        id: role === 'instructor' ? 'demo-instructor' : 'demo-student',
        name: role === 'instructor' ? 'Taylor Instructor' : 'Jamie Student',
        role
      }
      setUser(demoUser)
      localStorage.setItem('lh-demo-user', JSON.stringify(demoUser))
    },
    logout() {
      setUser(null)
      localStorage.removeItem('lh-demo-user')
    }
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
