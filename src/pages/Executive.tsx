import { useEffect, useState } from 'react'
import {
  TrendingUp, CheckCircle2, XCircle, AlertCircle, Cpu, MemoryStick, HardDrive,
  Clock, Building2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { fmt, pct, hours, CHART_COLORS } from '@/lib/format'
import { KpiCard } from '@/components/charts/KpiCard'
import { SparkArea, TrendArea, HBar, Donut, VBar } from '@/components/charts/Charts'

export function ExecutivePage() {
  const { filters } = useFilters()
  const { t } = useI18n()
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    api.executive(filters).then(setD).catch((e) => setErr(String(e)))
  }, [JSON.stringify(filters)])

  if (err) return <EmptyState err={err} />
  if (!d) return <div className="text-muted-foreground">{t('common.loading')}</div>
  const s = d.summary

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">{t('exec.title')}</h1>
      <p className="text-sm text-muted-foreground -mt-3">{t('exec.subtitle')}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        <KpiCard title={t('kpi.total')} value={fmt(s.total_requests)} accent="primary"
          icon={<TrendingUp className="size-4" />}
          children={<SparkArea data={d.trend} dataKey="requests" />} />
        <KpiCard title={t('kpi.open')} value={fmt(s.open_requests)} accent="warning"
          icon={<AlertCircle className="size-4" />} sub={t('kpi.open_sub')} />
        <KpiCard title={t('kpi.closed')} value={fmt(s.closed_requests)} accent="success"
          icon={<CheckCircle2 className="size-4" />} sub={`${pct(s.fulfillment_rate)} ${t('kpi.fulfillment')}`} />
        <KpiCard title={t('kpi.rejected')} value={fmt(s.rejected_requests)} accent="danger"
          icon={<XCircle className="size-4" />} sub={`${pct(s.rejection_rate)} ${t('kpi.rejection')}`} />
        <KpiCard title={t('kpi.avg_resolution')} value={hours(s.avg_lead_time_hours)} accent="accent"
          icon={<Clock className="size-4" />} sub={`${t('kpi.cycle')}: ${hours(s.avg_cycle_time_hours)}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title={t('kpi.alloc_cpu')} value={`${fmt(s.allocated_cpu_vcpu)} vCPU`} accent="primary"
          icon={<Cpu className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_cpu_vcpu)} vCPU`}
          children={<SparkArea data={d.trend} dataKey="cpu" color={CHART_COLORS[0]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'cpu', name: 'CPU vCPU' }]} />} />
        <KpiCard title={t('kpi.alloc_ram')} value={fmt(s.allocated_ram_gb, { unit: 'GB' })} accent="accent"
          icon={<MemoryStick className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_ram_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="ram" color={CHART_COLORS[1]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'ram', name: 'RAM GB' }]} />} />
        <KpiCard title={t('kpi.alloc_storage')} value={fmt(s.allocated_storage_gb, { unit: 'GB' })} accent="success"
          icon={<HardDrive className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_storage_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="storage" color={CHART_COLORS[2]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'storage', name: 'Storage GB' }]} />} />
      </div>

      <div className="itrm-card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold">{t('sec.trend')}</h2>
          <span className="text-xs text-muted-foreground">{t('sec.monthly')}</span>
        </div>
        <TrendArea data={d.trend} height={300} keys={[
          { key: 'requests', name: t('kpi.total'), color: CHART_COLORS[0] },
          { key: 'cpu', name: 'CPU vCPU', color: CHART_COLORS[2] },
          { key: 'ram', name: 'RAM GB', color: CHART_COLORS[3] },
          { key: 'storage', name: 'Storage GB', color: CHART_COLORS[4] },
        ]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Building2 className="size-4" /> {t('sec.top_dept_req')}</h3>
          <HBar data={d.top_departments_by_requests} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('sec.by_env')}</h3>
          <Donut data={d.by_environment} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('sec.by_status')}</h3>
          <Donut data={d.by_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('sec.top_dept_ram')}</h3>
          <HBar data={d.top_departments_by_ram} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">{t('sec.by_type')}</h3>
          <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ err }: { err: string }) {
  const { t } = useI18n()
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <h2 className="text-lg font-semibold mb-2">{t('common.no_data')}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <span className="text-xs">({err})</span>
      </p>
      <a href="/upload" className="inline-block h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium">
        {t('common.go_upload')}
      </a>
    </div>
  )
}
