import { useFilters } from '@/lib/filters'
import { X } from 'lucide-react'

function Select({ label, value, onChange, items }:
  { label: string; value?: string | number; onChange: (v: any) => void;
    items: { value: string | number; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1 min-w-[140px]">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value === undefined ? 'ALL' : String(value)}
        onChange={(e) => onChange(e.target.value === 'ALL' ? undefined : e.target.value)}
        className="h-9 rounded-lg border border-border bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="ALL">All</option>
        {items.map((it) => (
          <option key={String(it.value)} value={String(it.value)}>{it.label}</option>
        ))}
      </select>
    </label>
  )
}

export function FilterBar() {
  const { filters, setFilter, reset, options } = useFilters()
  const active = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  return (
    <div className="border-b border-border bg-card/40 glass px-5 py-3 flex flex-wrap items-end gap-3">
      <Select label="Year" value={filters.year} onChange={(v) => setFilter('year', v ? Number(v) : undefined)}
        items={options.years.map((y) => ({ value: y, label: String(y) }))} />
      <Select label="Quarter" value={filters.quarter} onChange={(v) => setFilter('quarter', v ? Number(v) : undefined)}
        items={options.quarters.map((q) => ({ value: q, label: `Q${q}` }))} />
      <Select label="Month" value={filters.month} onChange={(v) => setFilter('month', v ? Number(v) : undefined)}
        items={options.months.map((m) => ({ value: m, label: String(m).padStart(2, '0') }))} />
      <Select label="Department" value={filters.department} onChange={(v) => setFilter('department', v)}
        items={options.departments.map((d) => ({ value: d, label: d.length > 36 ? d.slice(0, 34) + '…' : d }))} />
      <Select label="Environment" value={filters.environment} onChange={(v) => setFilter('environment', v)}
        items={options.environments.map((e) => ({ value: e, label: e }))} />
      <Select label="Request Type" value={filters.request_type} onChange={(v) => setFilter('request_type', v)}
        items={options.request_types.map((t) => ({ value: t.code, label: t.label }))} />
      <Select label="Status" value={filters.status} onChange={(v) => setFilter('status', v)}
        items={options.statuses.map((s) => ({ value: s, label: s }))} />
      <Select label="Priority" value={filters.priority} onChange={(v) => setFilter('priority', v)}
        items={options.priorities.map((p) => ({ value: p, label: p }))} />
      {active > 0 && (
        <button onClick={reset}
          className="h-9 px-3 rounded-lg text-sm border border-border hover:bg-muted flex items-center gap-1 self-end">
          <X className="size-3" /> Clear ({active})
        </button>
      )}
    </div>
  )
}
