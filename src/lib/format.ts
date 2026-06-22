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

// Chart palette aligned with the ITSM-SLA brand:
// primary green → teal → purple → amber → red → deep teal → magenta → yellow
export const CHART_COLORS = [
  '#2d7a5f', '#4EB6A6', '#8b5cf6', '#d97706', '#e53e3e',
  '#0c5563', '#b85ad1', '#f59e0b', '#38bdf8', '#84cc16',
  '#f472b6', '#a3e635',
]
