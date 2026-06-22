import { useTheme } from 'next-themes'
import { Moon, Sun, Download, RefreshCw, Languages, PanelLeft, PanelLeftClose } from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n, Lang } from '@/lib/i18n'
import { useSidebar } from '@/lib/sidebar'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
]

export function Topbar() {
  const { setTheme, resolvedTheme } = useTheme()
  const { filters, refreshOptions } = useFilters()
  const { lang, setLang, t } = useI18n()
  const { collapsed, toggle } = useSidebar()

  return (
    <header className="h-14 px-4 sm:px-5 flex items-center gap-3 sticky top-0 z-30 glass border-b border-[var(--glass-border)]">
      <button
        onClick={toggle}
        title={t('topbar.refresh')}
        className="hidden md:grid size-9 place-items-center rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-[color:var(--soft)]">
        {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
      <div className="font-medium tracking-tight hidden sm:block truncate">{t('topbar.title')}</div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-[var(--glass-border)] glass-soft overflow-hidden">
          <Languages className="size-4 mx-2 text-[color:var(--soft)]" />
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-2.5 h-9 text-xs font-medium transition ${
                lang === l.code
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'hover:bg-white/40 dark:hover:bg-white/5'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => refreshOptions()}
          className="size-9 grid place-items-center rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-[color:var(--soft)]"
          title={t('topbar.refresh')}>
          <RefreshCw className="size-4" />
        </button>
        <a
          href={api.exportUrl('xlsx', filters)}
          className="hidden md:inline-flex h-9 px-3 rounded-xl items-center gap-2 text-sm font-medium text-white shadow-[0_2px_10px_rgba(45,122,95,0.35)]"
          style={{ background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-soft) 130%)' }}>
          <Download className="size-4" /> {t('topbar.export_xlsx')}
        </a>
        <a
          href={api.exportUrl('csv', filters)}
          className="hidden md:inline-flex h-9 px-3 rounded-xl items-center gap-2 text-sm border border-[var(--glass-border)] glass-soft hover:bg-white/40 dark:hover:bg-white/5">
          <Download className="size-4" /> {t('topbar.export_csv')}
        </a>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="size-9 grid place-items-center rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-[color:var(--soft)]"
          title={t('topbar.toggle_theme')}>
          {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  )
}
