import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'
import { clearBuilderStorage } from '../hooks/useBuilderState'

interface UserPlan {
  name: string
  label: string
  features: Record<string, boolean | number>
  transactionFeePct: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  cpfCnpj: string | null
  bankCode: string | null
  bankConfigured: boolean
  kycStatus: string
  onboardingRequired: boolean
  createdAt: string
  plan: UserPlan | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  setUser: (u: User | null) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me()
      .then(userData => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.logout().catch(() => {})
    clearBuilderStorage()
    setUser(null)
  }

  const refreshUser = async () => {
    const userData = await api.me()
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
