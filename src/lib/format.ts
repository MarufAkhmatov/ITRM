export function fmt(n: number | null | undefined, opts: { unit?: string; digits?: number } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  const { unit = '', digits = 0 } = opts
  const abs = Math.abs(n)
  let v = n, suffix = ''
  if (unit === 'GB' && abs >= 1024) { v = n / 1024; suffix = ' TB' }
  else if (abs >= 1_000_000) { v = n / 1_000_000; suffix = 'M' }
  else if (abs >= 10_000) { v = n / 1_000; suffix = 'K' }
  const txt = v.toLocaleString(undefined, { maximumFractionDigits: digits || (suffix ? 1 : 0) })
  return suffix ? `${txt}${suffix.startsWith(' ') ? suffix : suffix}` : (unit ? `${txt} ${unit}` : txt)
}

export function pct(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits)}%`
}

export function hours(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  if (n < 24) return `${n.toFixed(1)} h`
  if (n < 24 * 30) return `${(n / 24).toFixed(1)} d`
  return `${(n / (24 * 30)).toFixed(1)} mo`
}

export const CHART_COLORS = [
  'hsl(217 91% 60%)', 'hsl(199 89% 48%)', 'hsl(142 71% 45%)',
  'hsl(38 92% 50%)',  'hsl(0 84% 60%)',   'hsl(262 83% 58%)',
  'hsl(176 70% 45%)', 'hsl(24 95% 53%)',  'hsl(305 70% 55%)',
  'hsl(190 80% 50%)', 'hsl(50 85% 50%)',  'hsl(120 50% 50%)',
]
