import { useEffect } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Cpu, MemoryStick, HardDrive, X, Sparkles } from 'lucide-react'
import { useForecast, ForecastPayload } from '@/lib/forecast'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/format'

const grid = 'var(--border)'
const tick = { fill: 'var(--muted-foreground)', fontSize: 11 }

const ICONS: Record<string, any> = { cpu: Cpu, ram: MemoryStick, storage: HardDrive }

function mergeSeries(
  history: { month: string; value: number }[],
  monthly: { month: string; expected: number; best: number; worst: number }[]
) {
  const rows: any[] = history.map((h) => ({ month: h.month, actual: h.value }))
  for (const f of monthly) rows.push({ month: f.month, expected: f.expected, best: f.best, worst: f.worst })
  return rows
}

function ResourceCard({ kind, data }: { kind: 'cpu' | 'ram' | 'storage'; data: ForecastPayload['resources']['cpu'] }) {
  const { t } = useI18n()
  const Icon = ICONS[kind]
  const merged = mergeSeries(data.history, data.monthly)
  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-xl grid place-items-center text-[var(--primary)]"
             style={{ background: 'color-mix(in oklab, var(--primary) 14%, transparent)' }}>
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t(`fc.${kind}`)}</div>
          <div className="text-2xl font-light tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            {fmt(data.total.expected, { unit: data.unit })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-border px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('fc.best_case')}</div>
          <div className="font-medium text-[color:var(--success)]">{fmt(data.total.best, { unit: data.unit })}</div>
        </div>
        <div className="rounded-lg border border-border px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('fc.worst_case')}</div>
          <div className="font-medium text-[color:var(--danger)]">{fmt(data.total.worst, { unit: data.unit })}</div>
        </div>
      </div>
      <div className="h-44 -mx-2 -mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 4, right: 6, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={`fc-${kind}-band`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={tick} interval="preserveStartEnd" />
            <YAxis tick={tick} width={48} />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: `1px solid ${grid}`, borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="worst"    name={t('fc.worst_case')}    stroke="none" fill={`url(#fc-${kind}-band)`} />
            <Line type="monotone" dataKey="actual"   name={t('fc.history')}       stroke="var(--primary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expected" name={t('fc.expected')}      stroke="var(--accent)"  strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="best"     name={t('fc.best_case')}     stroke="var(--success)" strokeWidth={1.5} strokeDasharray="2 4" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ForecastModal() {
  const { payload, close } = useForecast()
  const { t } = useI18n()

  useEffect(() => {
    if (!payload) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [payload, close])

  if (!payload) return null

  const title = payload.horizon === 'rest_2026' ? t('fc.title.rest_2026') : t('fc.title.y2027')
  const trained = payload.trained_on

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in"
      onClick={close}>
      <div
        className="w-full max-w-6xl max-h-[92vh] overflow-auto pn-scroll itrm-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl grid place-items-center text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)' }}>
              <Sparkles className="size-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AMIR</div>
              <div className="text-2xl font-semibold tracking-tight">{title}</div>
              {trained?.from && trained?.to && (
                <div className="text-xs text-muted-foreground mt-1">
                  {t('fc.trained_on', { from: trained.from, to: trained.to, n: trained.months })}
                </div>
              )}
            </div>
          </div>
          <button onClick={close}
            className="size-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
            title="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ResourceCard kind="cpu"     data={payload.resources.cpu} />
          <ResourceCard kind="ram"     data={payload.resources.ram} />
          <ResourceCard kind="storage" data={payload.resources.storage} />
        </div>
      </div>
    </div>
  )
}
