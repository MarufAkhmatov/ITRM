import { ReactNode, useState } from 'react'
import { cn } from '@/lib/cn'
import { Maximize2 } from 'lucide-react'

type Trend = { value: number; label?: string }
type Accent = 'primary' | 'success' | 'warning' | 'danger' | 'accent'

const ACCENT: Record<Accent, { ring: string; bg: string }> = {
  primary: { ring: 'var(--primary)',       bg: 'color-mix(in oklab, var(--primary) 14%, transparent)' },
  success: { ring: 'var(--success)',       bg: 'color-mix(in oklab, var(--success) 14%, transparent)' },
  warning: { ring: 'var(--warning)',       bg: 'color-mix(in oklab, var(--warning) 16%, transparent)' },
  danger:  { ring: 'var(--danger)',        bg: 'color-mix(in oklab, var(--danger) 14%, transparent)' },
  accent:  { ring: 'var(--accent)',        bg: 'color-mix(in oklab, var(--accent) 14%, transparent)' },
}

export function KpiCard({
  title, value, sub, icon, trend, accent = 'primary', children, expanded,
}: {
  title: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  trend?: Trend
  accent?: Accent
  children?: ReactNode
  expanded?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const a = ACCENT[accent]
  return (
    <>
      <div className="group itrm-card p-4 flex flex-col gap-3 relative transition-shadow hover:shadow-[0_12px_30px_rgba(20,40,55,0.10)]">
        <div className="flex items-start justify-between gap-2">
          <div
            className="size-10 rounded-xl grid place-items-center"
            style={{ background: a.bg, color: a.ring }}>
            {icon}
          </div>
          {(expanded || children) && (
            <button
              onClick={() => setOpen(true)}
              className="opacity-0 group-hover:opacity-100 transition size-7 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              title="Expand">
              <Maximize2 className="size-3.5" />
            </button>
          )}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="text-3xl font-light tracking-tight mt-0.5" style={{ letterSpacing: '-0.02em' }}>{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        {trend && (
          <div className={cn('text-xs', trend.value >= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]')}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value).toFixed(1)}%{' '}
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {children && <div className="h-20 -mx-2 -mb-2">{children}</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-6" onClick={() => setOpen(false)}>
          <div className="w-full max-w-5xl max-h-[85vh] overflow-auto itrm-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
                <div className="text-4xl font-light tracking-tight" style={{ letterSpacing: '-0.02em' }}>{value}</div>
              </div>
              <button onClick={() => setOpen(false)} className="size-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">✕</button>
            </div>
            {expanded || children}
          </div>
        </div>
      )}
    </>
  )
}
