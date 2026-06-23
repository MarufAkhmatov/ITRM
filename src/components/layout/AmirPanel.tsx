import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { useForecast } from '@/lib/forecast'

const DEMO_QUESTIONS = [
  { key: 'amir.suggest.rest_2026', query: 'Forecast resource demand until end of 2026' },
  { key: 'amir.suggest.y2027',     query: 'Forecast resource demand for 2027' },
]

export function AmirPanel() {
  const { t } = useI18n()
  const { open: openForecast } = useForecast()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ role: string; text: string }[]>([])
  const [busy, setBusy] = useState(false)

  const ask = async (query: string, label?: string) => {
    const text = (label ?? query).trim()
    if (!query.trim()) return
    setThread((tr) => [...tr, { role: 'user', text }])
    setQ('')
    setBusy(true)
    try {
      const r = await api.amir(query)
      setThread((tr) => [...tr, { role: 'amir', text: r.answer }])
      if (r?.ui?.open === 'forecast_modal' && r?.data?.resources) {
        if (window.location.pathname !== '/') nav('/')
        openForecast(r.data)
        // Auto-collapse the panel so the modal isn't hidden under it.
        setOpen(false)
      }
    } catch (e: any) {
      setThread((tr) => [...tr, { role: 'amir', text: `Error: ${e.message || e}` }])
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="AMIR"
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full text-white shadow-xl grid place-items-center hover:scale-105 transition"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)' }}>
        <Sparkles className="size-6" />
      </button>
    )
  }
  return (
    <aside className="fixed bottom-6 right-6 z-40 w-[400px] max-h-[70vh] itrm-card flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Sparkles className="size-4 text-[color:var(--primary)]" />
        <div className="font-medium">AMIR</div>
        <button onClick={() => setOpen(false)}
          className="ml-auto size-7 grid place-items-center rounded hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <div className="p-3 border-b border-border flex flex-col gap-2">
        {DEMO_QUESTIONS.map((d) => (
          <button key={d.key} onClick={() => ask(d.query, t(d.key))} disabled={busy}
            className="text-left text-xs px-3 py-2 rounded-lg border border-[var(--glass-border)] glass-soft hover:bg-[var(--active-chip)] hover:text-[color:var(--active-icon)] transition disabled:opacity-60">
            {t(d.key)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pn-scroll p-3 space-y-2">
        {thread.length === 0 && (
          <div className="text-xs text-muted-foreground">{t('amir.empty_panel')}</div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
              m.role === 'user' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-muted'
            }`}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">{t('amir.thinking')}</div>}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(q)}
          placeholder={t('amir.placeholder')}
          className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm" />
        <button onClick={() => ask(q)} disabled={busy}
          className="size-9 grid place-items-center rounded-lg text-white"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)' }}>
          <Send className="size-4" />
        </button>
      </div>
    </aside>
  )
}
