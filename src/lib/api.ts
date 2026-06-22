export type Filters = Partial<{
  year: number; quarter: number; month: number;
  department: string; environment: string; request_type: string;
  status: string; server_type: string; priority: string;
}>

function qs(f?: Filters) {
  if (!f) return ''
  const p = new URLSearchParams()
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') p.set(k, String(v))
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function j<T = any>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, init)
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return r.json() as Promise<T>
}

export const api = {
  health: () => j('/api/health'),
  filters: () => j('/api/filters'),
  uploads: () => j('/api/uploads'),
  activate: (id: string) => j(`/api/uploads/${id}/activate`, { method: 'POST' }),
  upload: async (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  },
  executive: (f?: Filters) => j(`/api/kpis/executive${qs(f)}`),
  requestType: (code: string, f?: Filters) =>
    j(`/api/kpis/request-type/${encodeURIComponent(code)}${qs(f)}`),
  departments: (f?: Filters) => j(`/api/kpis/departments${qs(f)}`),
  requests: (f?: Filters & { limit?: number; offset?: number }) =>
    j(`/api/requests${qs(f as Filters)}`),
  amin: (query: string) =>
    j('/api/amin/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),
  exportUrl: (kind: 'csv' | 'xlsx' | 'json', f?: Filters) =>
    `/api/export/${kind}${qs(f)}`,
}
