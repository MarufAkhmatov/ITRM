import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { fmt, pct, hours } from '@/lib/format'
import { KpiCard } from '@/components/charts/KpiCard'
import { TrendArea, HBar, Donut } from '@/components/charts/Charts'
import {
  CheckCircle2, XCircle, AlertCircle, Cpu, ListChecks,
} from 'lucide-react'

export function RequestTypePage() {
  const { code = '' } = useParams()
  const { filters } = useFilters()
  const { t } = useI18n()
  const [d, setD] = useState<any>(null)

  useEffect(() => {
    api.requestType(code, filters).then(setD).catch(() => setD(null))
  }, [code, JSON.stringify(filters)])

  if (!d) return <div className="text-muted-foreground">{t('common.loading')}</div>
  const s = d.summary

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{d.label}</h1>
        <p className="text-sm text-muted-foreground">
          {t('rt.subtitle')} <code className="text-xs px-1.5 py-0.5 rounded bg-muted">{d.code}</code>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard title={t('rt.summary.total')} value={fmt(s.total)} accent="primary" icon={<ListChecks className="size-4" />} />
        <KpiCard title={t('kpi.open')} value={fmt(s.open)} accent="warning" icon={<AlertCircle className="size-4" />} />
        <KpiCard title={t('kpi.closed')} value={fmt(s.closed)} accent="success"
          icon={<CheckCircle2 className="size-4" />} sub={`${pct(s.fulfillment_rate)} ${t('rt.summary.fulfilled')}`} />
        <KpiCard title={t('kpi.rejected')} value={fmt(s.rejected)} accent="danger" icon={<XCircle className="size-4" />} />
        <KpiCard title={t('kpi.avg_resolution')} value={hours(s.avg_lead_time_hours)} accent="accent"
          sub={`${t('kpi.cycle')}: ${hours(s.avg_cycle_time_hours)}`} />
        <KpiCard title={t('rt.allocated')} value={`${fmt(s.allocated_cpu_vcpu)} vCPU`} accent="primary"
          icon={<Cpu className="size-4" />}
          sub={
            <>
              {fmt(s.allocated_ram_gb, { unit: 'GB' })} RAM · {fmt(s.allocated_storage_gb, { unit: 'GB' })} Storage
            </>
          } />
      </div>

      <div className="itrm-card p-5">
        <h2 className="font-semibold mb-3">{t('rt.monthly_volume')}</h2>
        <TrendArea data={d.trend} keys={[{ key: 'requests', name: t('rt.requests') }]} height={260} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('rt.by_status')}</h3>
          <Donut data={d.by_status} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('rt.by_env')}</h3>
          <Donut data={d.by_environment} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('rt.by_priority')}</h3>
          <Donut data={d.by_priority} />
        </div>
      </div>

      <div className="itrm-card p-5">
        <h3 className="font-semibold mb-3">{t('rt.top_depts')}</h3>
        <HBar data={d.top_departments} />
      </div>

      <div className="itrm-card p-5 overflow-x-auto">
        <h3 className="font-semibold mb-3">{t('rt.requests')} ({d.rows.length})</h3>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3">{t('rt.col.key')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.summary')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.status')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.priority')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.department')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.env')}</th>
              <th className="text-right py-2 pr-3">{t('rt.col.cpu')}</th>
              <th className="text-right py-2 pr-3">{t('rt.col.ram')}</th>
              <th className="text-right py-2 pr-3">{t('rt.col.storage')}</th>
              <th className="text-left py-2 pr-3">{t('rt.col.created')}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r: any) => (
              <tr key={r.issue_key} className="border-b border-border/60 hover:bg-muted/40">
                <td className="py-1.5 pr-3 font-mono">{r.issue_key}</td>
                <td className="py-1.5 pr-3 max-w-[280px] truncate" title={r.summary}>{r.summary}</td>
                <td className="py-1.5 pr-3">{r.status}</td>
                <td className="py-1.5 pr-3">{r.priority}</td>
                <td className="py-1.5 pr-3 max-w-[180px] truncate" title={r.department}>{r.department}</td>
                <td className="py-1.5 pr-3">{r.environment}</td>
                <td className="py-1.5 pr-3 text-right">{r.cpu_vcpu ?? '—'}</td>
                <td className="py-1.5 pr-3 text-right">{r.ram_gb ?? '—'}</td>
                <td className="py-1.5 pr-3 text-right">{r.storage_gb ?? '—'}</td>
                <td className="py-1.5 pr-3">{r.created_at ? r.created_at.slice(0, 10) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
