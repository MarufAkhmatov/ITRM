import { useEffect, useState, ReactNode } from 'react'
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

      {/* Row 1 — request KPIs (clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        <KpiCard title={t('kpi.total')} value={fmt(s.total_requests)} accent="primary"
          icon={<TrendingUp className="size-4" />}
          children={<SparkArea data={d.trend} dataKey="requests" />}
          expanded={<TotalDetail d={d} />} />
        <KpiCard title={t('kpi.open')} value={fmt(s.open_requests)} accent="warning"
          icon={<AlertCircle className="size-4" />} sub={t('kpi.open_sub')}
          expanded={<StatusDetail d={d} groupFilter="open" />} />
        <KpiCard title={t('kpi.closed')} value={fmt(s.closed_requests)} accent="success"
          icon={<CheckCircle2 className="size-4" />} sub={`${pct(s.fulfillment_rate)} ${t('kpi.fulfillment')}`}
          expanded={<ClosedDetail d={d} />} />
        <KpiCard title={t('kpi.rejected')} value={fmt(s.rejected_requests)} accent="danger"
          icon={<XCircle className="size-4" />} sub={`${pct(s.rejection_rate)} ${t('kpi.rejection')}`}
          expanded={<RejectedDetail d={d} />} />
        <KpiCard title={t('kpi.avg_resolution')} value={hours(s.avg_lead_time_hours)} accent="accent"
          icon={<Clock className="size-4" />} sub={`${t('kpi.cycle')}: ${hours(s.avg_cycle_time_hours)}`}
          expanded={<ResolutionDetail d={d} />} />
      </div>

      {/* Row 2 — resource KPIs (clickable, deep drill-down) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title={t('kpi.alloc_cpu')} value={`${fmt(s.allocated_cpu_vcpu)} vCPU`} accent="primary"
          icon={<Cpu className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_cpu_vcpu)} vCPU`}
          children={<SparkArea data={d.trend} dataKey="cpu" color={CHART_COLORS[0]} />}
          expanded={<ResourceDetail d={d} k="cpu"
                       requested={s.requested_cpu_vcpu} allocated={s.allocated_cpu_vcpu}
                       unit="vCPU" topKey="top_departments_by_cpu" />} />
        <KpiCard title={t('kpi.alloc_ram')} value={fmt(s.allocated_ram_gb, { unit: 'GB' })} accent="accent"
          icon={<MemoryStick className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_ram_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="ram" color={CHART_COLORS[1]} />}
          expanded={<ResourceDetail d={d} k="ram"
                       requested={s.requested_ram_gb} allocated={s.allocated_ram_gb}
                       unit="GB" topKey="top_departments_by_ram" />} />
        <KpiCard title={t('kpi.alloc_storage')} value={fmt(s.allocated_storage_gb, { unit: 'GB' })} accent="success"
          icon={<HardDrive className="size-4" />}
          sub={`${t('kpi.requested')}: ${fmt(s.requested_storage_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="storage" color={CHART_COLORS[2]} />}
          expanded={<ResourceDetail d={d} k="storage"
                       requested={s.requested_storage_gb} allocated={s.allocated_storage_gb}
                       unit="GB" topKey="top_departments_by_storage" />} />
      </div>

      {/* Trend (big) */}
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

/* ============================================================================
   Drill-down panels — one per KPI category. All use data already on the page.
   ========================================================================= */

function Panel({ title, children, full }: { title?: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={'rounded-xl border border-border p-4 ' + (full ? 'col-span-full' : '')}>
      {title && <h3 className="font-semibold mb-3 text-sm">{title}</h3>}
      {children}
    </div>
  )
}

function MiniTable({ rows, cols }: { rows: any[]; cols: { key: string; label: string; align?: 'left' | 'right' }[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          {cols.map((c) => (
            <th key={c.key} className={`py-1.5 pr-3 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/60 last:border-0">
            {cols.map((c) => (
              <td key={c.key} className={`py-1.5 pr-3 ${c.align === 'right' ? 'text-right font-mono' : ''} max-w-[260px] truncate`} title={String(r[c.key])}>
                {r[c.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TotalDetail({ d }: { d: any }) {
  const s = d.summary
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel title="Monthly volume" full>
        <TrendArea data={d.trend} height={240} keys={[{ key: 'requests', name: 'Requests', color: CHART_COLORS[0] }]} />
      </Panel>
      <Panel title={`Fulfillment / Rejection / Open`}>
        <ul className="text-sm space-y-1.5">
          <li className="flex justify-between"><span>Fulfilled</span><span className="font-mono">{fmt(s.fulfilled_requests)} ({pct(s.fulfillment_rate)})</span></li>
          <li className="flex justify-between"><span>Rejected</span><span className="font-mono">{fmt(s.rejected_requests)} ({pct(s.rejection_rate)})</span></li>
          <li className="flex justify-between"><span>Open</span><span className="font-mono">{fmt(s.open_requests)}</span></li>
          <li className="flex justify-between"><span>Closed</span><span className="font-mono">{fmt(s.closed_requests)}</span></li>
        </ul>
      </Panel>
      <Panel title="By request type">
        <Donut data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} height={200} />
      </Panel>
      <Panel title="By environment">
        <Donut data={d.by_environment} height={200} />
      </Panel>
      <Panel title="Top departments" full>
        <HBar data={d.top_departments_by_requests} height={260} />
      </Panel>
    </div>
  )
}

function StatusDetail({ d, groupFilter }: { d: any; groupFilter: 'open' | 'closed' | 'rejected' }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Status breakdown">
        <Donut data={d.by_status} height={240} />
      </Panel>
      <Panel title={`By environment (${groupFilter})`}>
        <Donut data={d.by_environment} height={240} />
      </Panel>
      <Panel title="Monthly volume" full>
        <TrendArea data={d.trend} height={240} keys={[{ key: 'requests', name: 'Requests', color: CHART_COLORS[3] }]} />
      </Panel>
      <Panel title="Top departments (requests)" full>
        <HBar data={d.top_departments_by_requests.slice(0, 10)} height={280} />
      </Panel>
    </div>
  )
}

function ClosedDetail({ d }: { d: any }) {
  const s = d.summary
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Fulfillment rate" >
        <div className="text-4xl font-light">{pct(s.fulfillment_rate)}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {fmt(s.fulfilled_requests)} / {fmt(s.total_requests)} requests delivered.
        </div>
      </Panel>
      <Panel title="Status mix">
        <Donut data={d.by_status} height={200} />
      </Panel>
      <Panel title="Monthly trend (requests + allocated resources)" full>
        <TrendArea data={d.trend} height={260} keys={[
          { key: 'requests', name: 'Requests', color: CHART_COLORS[0] },
          { key: 'cpu', name: 'CPU vCPU', color: CHART_COLORS[2] },
          { key: 'ram', name: 'RAM GB', color: CHART_COLORS[3] },
        ]} />
      </Panel>
      <Panel title="By request type" full>
        <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} height={240} />
      </Panel>
    </div>
  )
}

function RejectedDetail({ d }: { d: any }) {
  const s = d.summary
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Rejection rate">
        <div className="text-4xl font-light">{pct(s.rejection_rate)}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {fmt(s.rejected_requests)} / {fmt(s.total_requests)} requests rejected.
        </div>
      </Panel>
      <Panel title="Status mix">
        <Donut data={d.by_status} height={200} />
      </Panel>
      <Panel title="Top departments overall" full>
        <HBar data={d.top_departments_by_requests.slice(0, 10)} height={260} />
      </Panel>
      <Panel title="By request type" full>
        <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} height={240} />
      </Panel>
    </div>
  )
}

function ResolutionDetail({ d }: { d: any }) {
  const s = d.summary
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="Average lead time"><div className="text-4xl font-light">{hours(s.avg_lead_time_hours)}</div></Panel>
      <Panel title="Average cycle time"><div className="text-4xl font-light">{hours(s.avg_cycle_time_hours)}</div></Panel>
      <Panel title="Requests by status" full>
        <Donut data={d.by_status} height={240} />
      </Panel>
      <Panel title="Requests by type" full>
        <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} height={240} />
      </Panel>
    </div>
  )
}

function ResourceDetail({ d, k, requested, allocated, unit, topKey }:
  { d: any; k: 'cpu' | 'ram' | 'storage'; requested: number; allocated: number;
    unit: string; topKey: 'top_departments_by_cpu' | 'top_departments_by_ram' | 'top_departments_by_storage' }) {
  const variance = allocated && requested ? (requested - allocated) : 0
  const variancePct = requested ? (variance / requested * 100) : 0
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel title="Requested">
        <div className="text-3xl font-light">{fmt(requested, { unit })}</div>
      </Panel>
      <Panel title="Allocated">
        <div className="text-3xl font-light">{fmt(allocated, { unit })}</div>
      </Panel>
      <Panel title="Gap (requested − allocated)">
        <div className="text-3xl font-light">{fmt(variance, { unit })}</div>
        <div className="text-xs text-muted-foreground mt-1">{variancePct.toFixed(1)}% of demand</div>
      </Panel>

      <Panel title="Monthly demand trend" full>
        <TrendArea data={d.trend} height={260} keys={[{ key: k, name: unit }]} />
      </Panel>

      <Panel title="Top consuming departments" full>
        <MiniTable
          rows={d[topKey].slice(0, 10)}
          cols={[
            { key: 'name', label: 'Department' },
            { key: 'value', label: `Σ ${unit}`, align: 'right' },
          ]} />
      </Panel>

      <Panel title="By environment">
        <Donut data={d.by_environment} height={220} />
      </Panel>

      <Panel title="By request type" full>
        <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} height={220} />
      </Panel>
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
      <a href="/upload" className="inline-block h-10 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium">
        {t('common.go_upload')}
      </a>
    </div>
  )
}
