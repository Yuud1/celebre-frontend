import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api, getToken } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  cpfCnpj: string | null
  pixKey: string | null
  kycStatus: string
  createdAt: string
}

interface AuthContextValue {
  token: string | null
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken() || null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (t: string) => {
    try {
      const userData = await api.me(t)
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser(token).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (newToken: string) => {
    localStorage.setItem('celebre-token', newToken)
    setToken(newToken)
    await fetchUser(newToken)
  }

  const logout = () => {
    localStorage.removeItem('celebre-token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) await fetchUser(token)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
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
