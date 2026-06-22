import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type User = { username: string; role: string }
type Ctx = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const A = createContext<Ctx | null>(null)
const LS_KEY = 'itrm.auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const { user, token } = JSON.parse(raw)
        if (user && token) { setUser(user); setToken(token) }
      } catch {}
    }
  }, [])

  const login = async (username: string, password: string) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!r.ok) throw new Error('Invalid credentials')
    const data = await r.json()
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem(LS_KEY, JSON.stringify({ user: data.user, token: data.token }))
  }

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {})
    }
    setUser(null); setToken(null)
    localStorage.removeItem(LS_KEY)
  }

  return <A.Provider value={{ user, token, login, logout }}>{children}</A.Provider>
}

export function useAuth() {
  const c = useContext(A)
  if (!c) throw new Error('useAuth must be inside AuthProvider')
  return c
}
