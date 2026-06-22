import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Server, ServerCog, Globe, Globe2,
  KeyRound, Boxes, Trash2, DatabaseBackup, HelpCircle, Upload,
  Settings, Sparkles, Activity,
} from 'lucide-react'
import { useFilters } from '@/lib/filters'
import { cn } from '@/lib/cn'

const TYPE_ICON: Record<string, any> = {
  new_server: Server, expand_server: ServerCog,
  dns_internal: Globe, dns_external: Globe2,
  tech_account: KeyRound, app_install: Boxes,
  server_delete: Trash2, backup: DatabaseBackup, other: HelpCircle,
}

export function Sidebar() {
  const { options } = useFilters()
  const item = (active: boolean) =>
    cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
       active
         ? 'bg-primary/15 text-primary font-medium'
         : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5')

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground overflow-y-auto scrollbar-thin">
      <div className="p-5 flex items-center gap-2">
        <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold">I</div>
        <div>
          <div className="font-semibold tracking-tight">ITRM</div>
          <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">Resource Mgmt</div>
        </div>
      </div>

      <nav className="px-3 pb-4 space-y-1">
        <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Overview</div>
        <NavLink to="/" end className={({ isActive }) => item(isActive)}>
          <LayoutDashboard className="size-4" /> Executive Dashboard
        </NavLink>
        <NavLink to="/departments" className={({ isActive }) => item(isActive)}>
          <Building2 className="size-4" /> Department Analytics
        </NavLink>
        <NavLink to="/capacity" className={({ isActive }) => item(isActive)}>
          <Activity className="size-4" /> Capacity (Phase 2)
        </NavLink>

        <div className="px-2 pt-5 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Request Types</div>
        {options.request_types.length === 0 && (
          <div className="px-3 py-2 text-xs text-sidebar-foreground/40">Upload data to populate</div>
        )}
        {options.request_types.map((t) => {
          const Icon = TYPE_ICON[t.code] || HelpCircle
          return (
            <NavLink key={t.code} to={`/request-type/${t.code}`} className={({ isActive }) => item(isActive)}>
              <Icon className="size-4" /> <span className="truncate">{t.label}</span>
            </NavLink>
          )
        })}

        <div className="px-2 pt-5 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Admin</div>
        <NavLink to="/upload" className={({ isActive }) => item(isActive)}>
          <Upload className="size-4" /> Upload & ETL
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => item(isActive)}>
          <Settings className="size-4" /> Settings
        </NavLink>
        <NavLink to="/amin" className={({ isActive }) => item(isActive)}>
          <Sparkles className="size-4" /> AMIN Copilot
        </NavLink>
      </nav>
    </aside>
  )
}
