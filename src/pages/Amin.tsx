import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { api } from '@/lib/api'

const EXAMPLES = [
  'Executive summary',
  'Top departments by RAM',
  'Which department consumed most CPU this year?',
  'Forecast CPU next year',
  'Top departments',
]

export function AminPage() {
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ role: string; text: string; data?: any }[]>([])
  const [busy, setBusy] = useState(false)

  const ask = async (text?: string) => {
    const query = (text ?? q).trim()
    if (!query) return
    setThread((t) => [...t, { role: 'user', text: query }])
    setQ('')
    setBusy(true)
    try {
      const r = await api.amin(query)
      setThread((t) => [...t, { role: 'amin', text: r.answer, data: r.data }])
    } catch (e: any) {
      setThread((t) => [...t, { role: 'amin', text: `Error: ${e.message || e}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AMIN — IT Resource Copilot</h1>
          <p className="text-sm text-muted-foreground">
            Ask about departments, resources, trends, forecasts. Answers are grounded on the active dataset.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => ask(ex)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted">
            {ex}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/70 glass p-5 space-y-3 min-h-[300px]">
        {thread.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Try an example above, or type your own question.
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
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
        {busy && <div className="text-xs text-muted-foreground">AMIN is thinking…</div>}
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask AMIN…"
          className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={() => ask()} disabled={busy}
          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2">
          <Send className="size-4" /> Send
        </button>
      </div>
    </div>
  )
}
