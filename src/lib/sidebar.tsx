import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Ctx = { collapsed: boolean; toggle: () => void; setCollapsed: (v: boolean) => void }
const C = createContext<Ctx | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('itrm.sidebar.collapsed') === '1')
  useEffect(() => { localStorage.setItem('itrm.sidebar.collapsed', collapsed ? '1' : '0') }, [collapsed])
  return <C.Provider value={{ collapsed, toggle: () => setCollapsed((v) => !v), setCollapsed }}>{children}</C.Provider>
}

export function useSidebar() {
  const c = useContext(C)
  if (!c) throw new Error('useSidebar must be inside SidebarProvider')
  return c
}
