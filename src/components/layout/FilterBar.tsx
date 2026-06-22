import { useState } from 'react'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { X, SlidersHorizontal } from 'lucide-react'

function Select({ label, value, onChange, items, allLabel }:
  { label: string; value?: string | number; onChange: (v: any) => void;
    items: { value: string | number; label: string }[]; allLabel: string }) {
  return (
    <label className="flex flex-col gap-1 min-w-[130px]">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value === undefined ? 'ALL' : String(value)}
        onChange={(e) => onChange(e.target.value === 'ALL' ? undefined : e.target.value)}
        className="h-9 rounded-lg border border-border bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="ALL">{allLabel}</option>
        {items.map((it) => (
          <option key={String(it.value)} value={String(it.value)}>{it.label}</option>
        ))}
      </select>
    </label>
  )
}

export function FilterBar() {
  const { filters, setFilter, reset, options } = useFilters()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const active = Object.values(filters).filter((v) => v !== undefined && v !== '').length

  return (
    <div className="border-b border-border bg-card/40 glass px-3 sm:px-5 py-3">
      <div className="flex items-center gap-2 md:hidden mb-2">
        <button onClick={() => setOpen(!open)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          {open ? 'Hide' : 'Filters'} {active > 0 && `(${active})`}
        </button>
        {active > 0 && (
          <button onClick={reset}
            className="h-9 px-3 rounded-lg text-sm border border-border hover:bg-muted flex items-center gap-1">
            <X className="size-3" /> {t('filter.clear')}
          </button>
        )}
      </div>
      <div className={`${open ? 'flex' : 'hidden'} md:flex flex-wrap items-end gap-3`}>
        <Select label={t('filter.year')} value={filters.year} onChange={(v) => setFilter('year', v ? Number(v) : undefined)}
          allLabel={t('filter.all')} items={options.years.map((y) => ({ value: y, label: String(y) }))} />
        <Select label={t('filter.quarter')} value={filters.quarter} onChange={(v) => setFilter('quarter', v ? Number(v) : undefined)}
          allLabel={t('filter.all')} items={options.quarters.map((q) => ({ value: q, label: `Q${q}` }))} />
        <Select label={t('filter.month')} value={filters.month} onChange={(v) => setFilter('month', v ? Number(v) : undefined)}
          allLabel={t('filter.all')} items={options.months.map((m) => ({ value: m, label: String(m).padStart(2, '0') }))} />
        <Select label={t('filter.department')} value={filters.department} onChange={(v) => setFilter('department', v)}
          allLabel={t('filter.all')} items={options.departments.map((d) => ({ value: d, label: d.length > 36 ? d.slice(0, 34) + '…' : d }))} />
        <Select label={t('filter.environment')} value={filters.environment} onChange={(v) => setFilter('environment', v)}
          allLabel={t('filter.all')} items={options.environments.map((e) => ({ value: e, label: e }))} />
        <Select label={t('filter.request_type')} value={filters.request_type} onChange={(v) => setFilter('request_type', v)}
          allLabel={t('filter.all')} items={options.request_types.map((rt) => ({ value: rt.code, label: rt.label }))} />
        <Select label={t('filter.status')} value={filters.status} onChange={(v) => setFilter('status', v)}
          allLabel={t('filter.all')} items={options.statuses.map((s) => ({ value: s, label: s }))} />
        <Select label={t('filter.priority')} value={filters.priority} onChange={(v) => setFilter('priority', v)}
          allLabel={t('filter.all')} items={options.priorities.map((p) => ({ value: p, label: p }))} />
        {active > 0 && (
          <button onClick={reset}
            className="hidden md:flex h-9 px-3 rounded-lg text-sm border border-border hover:bg-muted items-center gap-1 self-end">
            <X className="size-3" /> {t('filter.clear')} ({active})
          </button>
        )}
      </div>
    </div>
  )
}
