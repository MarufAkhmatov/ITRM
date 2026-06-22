import { ReactNode, useState } from 'react'
import { cn } from '@/lib/cn'
import { Maximize2 } from 'lucide-react'

type Trend = { value: number; label?: string }
export function KpiCard({
  title, value, sub, icon, trend, accent = 'primary', children, expanded,
}: {
  title: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  trend?: Trend
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'accent'
  children?: ReactNode
  expanded?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const accentMap: Record<string, string> = {
    primary: 'from-primary/15 to-primary/5 text-primary',
    success: 'from-success/15 to-success/5 text-success',
    warning: 'from-warning/15 to-warning/5 text-warning',
    danger: 'from-danger/15 to-danger/5 text-danger',
    accent: 'from-accent/15 to-accent/5 text-accent',
  }
  return (
    <>
      <div className="group rounded-2xl border border-border bg-card/70 glass p-4 flex flex-col gap-3 relative hover:shadow-lg transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('size-9 rounded-xl bg-gradient-to-br grid place-items-center', accentMap[accent])}>
            {icon}
          </div>
          {(expanded || children) && (
            <button onClick={() => setOpen(true)}
              className="opacity-0 group-hover:opacity-100 transition size-7 grid place-items-center rounded-lg hover:bg-muted">
              <Maximize2 className="size-3.5" />
            </button>
          )}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold tracking-tight mt-0.5">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        {trend && (
          <div className={cn('text-xs', trend.value >= 0 ? 'text-success' : 'text-danger')}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value).toFixed(1)}%{' '}
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {children && <div className="h-20 -mx-2 -mb-2">{children}</div>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-6" onClick={() => setOpen(false)}>
          <div className="w-full max-w-5xl max-h-[85vh] overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
                <div className="text-3xl font-semibold">{value}</div>
              </div>
              <button onClick={() => setOpen(false)} className="size-9 grid place-items-center rounded-lg hover:bg-muted">✕</button>
            </div>
            {expanded || children}
          </div>
        </div>
      )}
    </>
  )
}
