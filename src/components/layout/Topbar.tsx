import { useTheme } from 'next-themes'
import { Moon, Sun, Download, RefreshCw, Languages } from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n, Lang } from '@/lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
]

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const { filters, refreshOptions } = useFilters()
  const { lang, setLang, t } = useI18n()
  return (
    <header className="h-14 border-b border-border bg-card/60 glass flex items-center px-5 gap-3 sticky top-0 z-30">
      <div className="font-medium tracking-tight hidden sm:block truncate">{t('topbar.title')}</div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden" title={t('topbar.language')}>
          <Languages className="size-4 mx-2 text-muted-foreground" />
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-2.5 h-9 text-xs font-medium transition ${
                lang === l.code ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => refreshOptions()}
          className="size-9 grid place-items-center rounded-lg hover:bg-muted transition" title={t('topbar.refresh')}>
          <RefreshCw className="size-4" />
        </button>
        <a
          href={api.exportUrl('xlsx', filters)}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hidden md:flex items-center gap-2 hover:opacity-90">
          <Download className="size-4" /> {t('topbar.export_xlsx')}
        </a>
        <a
          href={api.exportUrl('csv', filters)}
          className="h-9 px-3 rounded-lg border border-border text-sm hidden md:flex items-center gap-2 hover:bg-muted">
          <Download className="size-4" /> {t('topbar.export_csv')}
        </a>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="size-9 grid place-items-center rounded-lg hover:bg-muted transition" title={t('topbar.toggle_theme')}>
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  )
}
