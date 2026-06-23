import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { useForecast } from '@/lib/forecast'

export function AmirPage() {
  const { t } = useI18n()
  const { open: openForecast } = useForecast()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ role: string; text: string; data?: any }[]>([])
  const [busy, setBusy] = useState(false)

  // The two pinned demo questions — sent verbatim so the backend's horizon
  // detector matches reliably (it scans for "2026"/"2027" plus end-of-year
  // markers in EN/RU/UZ).
  const DEMO_QUESTIONS = [
    { key: 'amir.suggest.rest_2026', query: 'Forecast resource demand until end of 2026' },
    { key: 'amir.suggest.y2027',     query: 'Forecast resource demand for 2027' },
  ]

  const ask = async (query: string, label?: string) => {
    const text = (label ?? query).trim()
    if (!query.trim()) return
    setThread((tr) => [...tr, { role: 'user', text }])
    setQ('')
    setBusy(true)
    try {
      const r = await api.amir(query)
      setThread((tr) => [...tr, { role: 'amir', text: r.answer, data: r.data }])
      // If the backend asked us to open a modal, do it (and ensure we're on
      // the dashboard so the modal overlays a useful background).
      if (r?.ui?.open === 'forecast_modal' && r?.data?.resources) {
        if (window.location.pathname !== '/') nav('/')
        openForecast(r.data)
      }
    } catch (e: any) {
      setThread((tr) => [...tr, { role: 'amir', text: `Error: ${e.message || e}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl grid place-items-center text-white"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)' }}>
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('amir.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('amir.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_QUESTIONS.map((d) => (
          <button key={d.key} onClick={() => ask(d.query, t(d.key))}
            className="text-sm px-4 py-2 rounded-full border border-[var(--glass-border)] glass-soft hover:bg-[var(--active-chip)] hover:text-[color:var(--active-icon)] transition">
            {t(d.key)}
          </button>
        ))}
      </div>

      <div className="itrm-card p-5 space-y-3 min-h-[300px]">
        {thread.length === 0 && (
          <div className="text-sm text-muted-foreground">{t('amir.empty')}</div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-muted'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">{t('amir.thinking')}</div>}
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(q)}
          placeholder={t('amir.placeholder')}
          className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={() => ask(q)} disabled={busy}
          className="h-11 px-4 rounded-xl text-white font-medium flex items-center gap-2"
          style={{ background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-soft) 130%)' }}>
          <Send className="size-4" /> {t('amir.send')}
        </button>
      </div>
    </div>
  )
}
