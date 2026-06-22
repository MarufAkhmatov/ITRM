import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Server, ServerCog, Globe, Globe2,
  KeyRound, Boxes, Trash2, DatabaseBackup, HelpCircle, Upload,
  Settings, Sparkles, Activity, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { useSidebar } from '@/lib/sidebar'
import { cn } from '@/lib/cn'

const TYPE_ICON: Record<string, any> = {
  new_server: Server, expand_server: ServerCog,
  dns_internal: Globe, dns_external: Globe2,
  tech_account: KeyRound, app_install: Boxes,
  server_delete: Trash2, backup: DatabaseBackup, other: HelpCircle,
}

export function Sidebar() {
  const { options } = useFilters()
  const { t } = useI18n()
  const { collapsed, toggle } = useSidebar()

  const Item = ({ to, end, icon: Icon, label }: { to: string; end?: boolean; icon: any; label: string }) => (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-xl transition-all relative',
          collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 h-10',
          isActive
            // active chip — green tint + teal icon (color inherited by Icon)
            ? 'bg-[var(--active-bg)] text-[color:var(--active-text)] shadow-[var(--active-glow)] [&_svg]:text-[color:var(--active-icon)]'
            : 'text-[color:var(--sidebar-foreground)]/75 hover:bg-white/40 dark:hover:bg-white/5 hover:text-[color:var(--sidebar-foreground)]'
        )
      }>
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="truncate text-sm">{label}</span>}
    </NavLink>
  )

  return (
    <aside
      className={cn(
        'shrink-0 transition-[width] duration-200 h-full overflow-hidden flex flex-col',
        'bg-[var(--sidebar)] glass border-r border-[var(--glass-border)]',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      <div className={cn('flex items-center gap-2 p-3 border-b border-[var(--glass-border)]', collapsed && 'justify-center')}>
        <div className="size-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-soft)] grid place-items-center text-white font-semibold shrink-0">I</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold tracking-tight leading-none">ITRM</div>
            <div className="text-[10px] uppercase tracking-wider text-[color:var(--sidebar-muted)] mt-1">Resource Mgmt</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggle}
            className="ml-auto size-8 grid place-items-center rounded-lg hover:bg-white/40 dark:hover:bg-white/5 text-[color:var(--sidebar-muted)]"
            title="Collapse">
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto pn-scroll px-2 py-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider text-[color:var(--sidebar-muted)]">
            {t('sidebar.overview')}
          </div>
        )}
        <Item to="/" end icon={LayoutDashboard} label={t('nav.executive')} />
        <Item to="/departments" icon={Building2} label={t('nav.departments')} />
        <Item to="/capacity" icon={Activity} label={t('nav.capacity')} />

        {!collapsed && (
          <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wider text-[color:var(--sidebar-muted)]">
            {t('sidebar.request_types')}
          </div>
        )}
        {options.request_types.length === 0 && !collapsed && (
          <div className="px-3 py-2 text-xs text-[color:var(--sidebar-muted)]">Upload data to populate</div>
        )}
        {options.request_types.map((rt) => (
          <Item key={rt.code} to={`/request-type/${rt.code}`} icon={TYPE_ICON[rt.code] || HelpCircle} label={rt.label} />
        ))}

        {!collapsed && (
          <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wider text-[color:var(--sidebar-muted)]">
            {t('sidebar.admin')}
          </div>
        )}
        <Item to="/upload" icon={Upload} label={t('nav.upload')} />
        <Item to="/settings" icon={Settings} label={t('nav.settings')} />
        <Item to="/amin" icon={Sparkles} label={t('nav.amin')} />
      </nav>

      {collapsed && (
        <button
          onClick={toggle}
          className="m-3 size-10 grid place-items-center rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-[color:var(--sidebar-muted)]"
          title="Expand">
          <PanelLeft className="size-4" />
        </button>
      )}
    </aside>
  )
}
