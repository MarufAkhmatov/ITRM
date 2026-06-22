import { useTheme } from 'next-themes'
import { Moon, Sun, Download, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const { filters, refreshOptions } = useFilters()
  return (
    <header className="h-14 border-b border-border bg-card/60 glass flex items-center px-5 gap-3 sticky top-0 z-30">
      <div className="font-medium tracking-tight">IT Resource Management — Executive Analytics</div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => refreshOptions()}
          className="size-9 grid place-items-center rounded-lg hover:bg-muted transition" title="Refresh filters">
          <RefreshCw className="size-4" />
        </button>
        <a
          href={api.exportUrl('xlsx', filters)}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90">
          <Download className="size-4" /> Export XLSX
        </a>
        <a
          href={api.exportUrl('csv', filters)}
          className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted">
          <Download className="size-4" /> CSV
        </a>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="size-9 grid place-items-center rounded-lg hover:bg-muted transition" title="Toggle theme">
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  )
}
