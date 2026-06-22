import { useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { api } from '@/lib/api'

export function AminPanel() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<{ role: string; text: string }[]>([])
  const [busy, setBusy] = useState(false)

  const ask = async () => {
    if (!q.trim()) return
    const query = q.trim()
    setThread((t) => [...t, { role: 'user', text: query }])
    setQ('')
    setBusy(true)
    try {
      const r = await api.amin(query)
      setThread((t) => [...t, { role: 'amin', text: r.answer }])
    } catch (e: any) {
      setThread((t) => [...t, { role: 'amin', text: `Error: ${e.message || e}` }])
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl grid place-items-center hover:scale-105 transition">
        <Sparkles className="size-6" />
      </button>
    )
  }
  return (
    <aside className="fixed bottom-6 right-6 z-40 w-[400px] max-h-[70vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <div className="font-medium">AMIN</div>
        <button onClick={() => setOpen(false)} className="ml-auto size-7 grid place-items-center rounded hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {thread.length === 0 && (
          <div className="text-xs text-muted-foreground">
            Try: <em>"executive summary"</em>, <em>"top departments by RAM"</em>,
            or <em>"forecast CPU next year"</em>.
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
              m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="text-xs text-muted-foreground">…</div>}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask AMIN…"
          className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm" />
        <button onClick={ask} disabled={busy}
          className="size-9 grid place-items-center rounded-lg bg-primary text-primary-foreground">
          <Send className="size-4" />
        </button>
      </div>
    </aside>
  )
}
