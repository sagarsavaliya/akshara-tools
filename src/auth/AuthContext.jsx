import { useMemo, useState } from 'react'
import { adminConfig, getSuperAdminFromEnv } from '../config/adminConfig.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(adminConfig.sessionStorageKey)
    return raw ? JSON.parse(raw) : null
  })

  const value = useMemo(() => ({
    session,
    isSuperAdmin: session?.role === 'super-admin',
    loginAsSuperAdmin: (email, pin) => {
      const admin = getSuperAdminFromEnv()
      if (!admin.isConfigured) {
        console.error('Super admin auth is not configured. Set VITE_ADMIN_EMAIL and VITE_ADMIN_PIN.')
        return false
      }

      const ok = email === admin.email && pin === admin.pin
      if (!ok) return false
      const next = { email, role: 'super-admin' }
      localStorage.setItem(adminConfig.sessionStorageKey, JSON.stringify(next))
      setSession(next)
      return true
    },
    logout: () => {
      localStorage.removeItem(adminConfig.sessionStorageKey)
      setSession(null)
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
