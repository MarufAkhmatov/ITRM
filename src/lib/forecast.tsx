import { createContext, useContext, useState, ReactNode } from 'react'

export type ForecastPayload = {
  horizon: 'rest_2026' | 'y2027'
  horizon_label: string
  trained_on: { from: string; to: string; months: number }
  resources: Record<'cpu' | 'ram' | 'storage', {
    unit: string
    monthly: { month: string; expected: number; best: number; worst: number }[]
    total:   { expected: number; best: number; worst: number }
    history: { month: string; value: number }[]
  }>
}

type Ctx = {
  payload: ForecastPayload | null
  open: (p: ForecastPayload) => void
  close: () => void
}
const F = createContext<Ctx | null>(null)

export function ForecastProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<ForecastPayload | null>(null)
  return (
    <F.Provider value={{ payload, open: setPayload, close: () => setPayload(null) }}>
      {children}
    </F.Provider>
  )
}

export function useForecast() {
  const c = useContext(F)
  if (!c) throw new Error('useForecast must be inside ForecastProvider')
  return c
}
