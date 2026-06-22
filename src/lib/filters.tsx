import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react'
import { api, Filters } from './api'

type Options = {
  years: number[]; quarters: number[]; months: number[];
  departments: string[]; environments: string[];
  request_types: { code: string; label: string }[];
  statuses: string[]; server_types: string[]; priorities: string[];
}

const DEFAULT_OPTIONS: Options = {
  years: [], quarters: [1, 2, 3, 4], months: Array.from({ length: 12 }, (_, i) => i + 1),
  departments: [], environments: [], request_types: [], statuses: [],
  server_types: [], priorities: [],
}

type Ctx = {
  filters: Filters
  setFilter: (k: keyof Filters, v: any) => void
  reset: () => void
  options: Options
  refreshOptions: () => Promise<void>
}

const FilterCtx = createContext<Ctx | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({})
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS)
  const refreshOptions = async () => {
    try { setOptions(await api.filters()) } catch { /* backend offline */ }
  }
  useEffect(() => { refreshOptions() }, [])
  const value = useMemo<Ctx>(() => ({
    filters,
    setFilter: (k, v) => setFilters((f) => ({ ...f, [k]: v === 'ALL' ? undefined : v })),
    reset: () => setFilters({}),
    options, refreshOptions,
  }), [filters, options])
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>
}

export function useFilters() {
  const ctx = useContext(FilterCtx)
  if (!ctx) throw new Error('useFilters must be inside FilterProvider')
  return ctx
}
