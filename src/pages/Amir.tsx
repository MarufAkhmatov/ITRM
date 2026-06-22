import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { useI18n } from '@/lib/i18n'

export function AmirPage() {
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ role: string; text: string; data?: any }[]>([])
  const [busy, setBusy] = useState(false)

  // Examples in the active UI language.
  const EXAMPLES: Record<string, string[]> = {
    en: ['Executive summary', 'Top departments by RAM',
         'Which department consumed most CPU this year?',
         'Forecast CPU next year', 'Top departments'],
    ru: ['Сводка по компании', 'Топ подразделений по RAM',
         'Какое подразделение использовало больше всего CPU в 2026?',
         'Прогноз CPU на следующий год', 'Топ подразделений'],
    uz: ['Sarhisob', 'RAM boʻyicha eng faol boʻlimlar',
         'Qaysi boʻlim eng koʻp CPU sarfladi?',
         'Keyingi yilga CPU prognozi', 'Eng faol boʻlimlar'],
  }
  const examples = EXAMPLES[lang] || EXAMPLES.en

  const ask = async (text?: string) => {
    const query = (text ?? q).trim()
    if (!query) return
    setThread((tr) => [...tr, { role: 'user', text: query }])
    setQ('')
    setBusy(true)
    try {
      const r = await api.amir(query)
      setThread((tr) => [...tr, { role: 'amir', text: r.answer, data: r.data }])
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
        {examples.map((ex) => (
          <button key={ex} onClick={() => ask(ex)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted">
            {ex}
          </button>
        ))}
      </div>

      <div className="itrm-card p-5 space-y-3 min-h-[300px]">
        {thread.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {t('amir.empty')}
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-muted'
            }`}>
              {m.text}
              {m.data && Array.isArray(m.data) && (
                <ul className="mt-2 text-xs space-y-0.5">
                  {m.data.slice(0, 6).map((d: any, j: number) => (
                    <li key={j} className="flex justify-between gap-3 border-t border-border/40 pt-1">
                      <span className="truncate max-w-[70%]" title={d.name || d.month}>{d.name || d.month}</span>
                      <span className="font-mono">{d.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">{t('amir.thinking')}</div>}
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder={t('amir.placeholder')}
          className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={() => ask()} disabled={busy}
          className="h-11 px-4 rounded-xl text-white font-medium flex items-center gap-2"
          style={{ background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-soft) 130%)' }}>
          <Send className="size-4" /> {t('amir.send')}
        </button>
      </div>
    </div>
  )
}
