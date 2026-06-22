import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Maximize2 } from 'lucide-react'

type Trend = { value: number; label?: string }
type Accent = 'primary' | 'success' | 'warning' | 'danger' | 'accent'

const ACCENT: Record<Accent, { ring: string; bg: string }> = {
  primary: { ring: 'var(--primary)', bg: 'color-mix(in oklab, var(--primary) 14%, transparent)' },
  success: { ring: 'var(--success)', bg: 'color-mix(in oklab, var(--success) 14%, transparent)' },
  warning: { ring: 'var(--warning)', bg: 'color-mix(in oklab, var(--warning) 16%, transparent)' },
  danger:  { ring: 'var(--danger)',  bg: 'color-mix(in oklab, var(--danger) 14%, transparent)'  },
  accent:  { ring: 'var(--accent)',  bg: 'color-mix(in oklab, var(--accent) 14%, transparent)'  },
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
  const clickable = Boolean(expanded || children)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : -1}
        onClick={() => clickable && setOpen(true)}
        onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen(true) } }}
        className={cn(
          'itrm-card p-4 flex flex-col gap-3 relative group transition',
          clickable && 'cursor-pointer hover:shadow-[0_14px_36px_rgba(20,40,55,0.14)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'
        )}>
        <div className="flex items-start justify-between gap-2">
          <div
            className="size-10 rounded-xl grid place-items-center"
            style={{ background: a.bg, color: a.ring }}>
            {icon}
          </div>
          {clickable && (
            <span className="opacity-0 group-hover:opacity-100 transition size-7 grid place-items-center rounded-lg bg-black/5 dark:bg-white/10 text-muted-foreground">
              <Maximize2 className="size-3.5" />
            </span>
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
        {children && <div className="h-20 -mx-2 -mb-2 pointer-events-none">{children}</div>}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in"
          onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-6xl max-h-[90vh] overflow-auto pn-scroll itrm-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-2xl grid place-items-center"
                  style={{ background: a.bg, color: a.ring }}>
                  {icon}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
                  <div className="text-4xl font-light tracking-tight" style={{ letterSpacing: '-0.02em' }}>{value}</div>
                  {sub && <div className="text-sm text-muted-foreground mt-1">{sub}</div>}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
                title="Close">✕</button>
            </div>
            <div className="space-y-5">
              {expanded || children}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
