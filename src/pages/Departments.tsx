import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { fmt } from '@/lib/format'
import { HBar, Heatmap } from '@/components/charts/Charts'

export function DepartmentsPage() {
  const { filters } = useFilters()
  const { t } = useI18n()
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    api.departments(filters).then(setD).catch(() => setD(null))
  }, [JSON.stringify(filters)])
  if (!d) return <div className="text-muted-foreground">{t('common.loading')}</div>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('dept.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('dept.subtitle', { n: d.rows.length })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('dept.top_req')}</h3>
          <HBar data={d.rows.slice(0, 10).map((r: any) => ({ name: r.department, value: r.requests }))} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('dept.top_ram')}</h3>
          <HBar data={[...d.rows].sort((a, b) => b.ram_gb - a.ram_gb).slice(0, 10)
            .map((r: any) => ({ name: r.department, value: r.ram_gb }))} />
        </div>
      </div>

      <div className="itrm-card p-5">
        <h3 className="font-semibold mb-3">{t('dept.heatmap')}</h3>
        <Heatmap rows={d.top_departments} cols={d.months} data={d.heatmap}
          rowKey="department" colKey="month" valueKey="value" />
      </div>

      <div className="itrm-card p-5 overflow-x-auto">
        <h3 className="font-semibold mb-3">{t('dept.all')}</h3>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3">{t('dept.col.department')}</th>
              <th className="text-right py-2 pr-3">{t('dept.col.requests')}</th>
              <th className="text-right py-2 pr-3">{t('dept.col.cpu')}</th>
              <th className="text-right py-2 pr-3">{t('dept.col.ram')}</th>
              <th className="text-right py-2 pr-3">{t('dept.col.storage')}</th>
              <th className="text-left py-2 pr-3">{t('dept.col.top_env')}</th>
              <th className="text-left py-2 pr-3">{t('dept.col.top_type')}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r: any) => (
              <tr key={r.department} className="border-b border-border/60 hover:bg-muted/40">
                <td className="py-1.5 pr-3 max-w-[280px] truncate" title={r.department}>{r.department}</td>
                <td className="py-1.5 pr-3 text-right">{fmt(r.requests)}</td>
                <td className="py-1.5 pr-3 text-right">{fmt(r.cpu_vcpu)}</td>
                <td className="py-1.5 pr-3 text-right">{fmt(r.ram_gb, { unit: 'GB' })}</td>
                <td className="py-1.5 pr-3 text-right">{fmt(r.storage_gb, { unit: 'GB' })}</td>
                <td className="py-1.5 pr-3">{r.top_env}</td>
                <td className="py-1.5 pr-3 max-w-[200px] truncate" title={r.top_request_type}>{r.top_request_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
