import { useEffect, useState } from 'react'
import {
  TrendingUp, CheckCircle2, XCircle, AlertCircle, Cpu, MemoryStick, HardDrive,
  Clock, Building2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { fmt, pct, hours, CHART_COLORS } from '@/lib/format'
import { KpiCard } from '@/components/charts/KpiCard'
import { SparkArea, TrendArea, HBar, Donut, VBar } from '@/components/charts/Charts'

export function ExecutivePage() {
  const { filters } = useFilters()
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    api.executive(filters).then(setD).catch((e) => setErr(String(e)))
  }, [JSON.stringify(filters)])

  if (err) return <EmptyState err={err} />
  if (!d) return <div className="text-muted-foreground">Loading…</div>
  const s = d.summary

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        Real-time view of IT infrastructure demand from Jira Service Management.
      </p>

      {/* Row 1 — request KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Requests" value={fmt(s.total_requests)} accent="primary"
          icon={<TrendingUp className="size-4" />}
          children={<SparkArea data={d.trend} dataKey="requests" />} />
        <KpiCard title="Open" value={fmt(s.open_requests)} accent="warning"
          icon={<AlertCircle className="size-4" />} sub="In Progress / To Do / Clarifying" />
        <KpiCard title="Closed" value={fmt(s.closed_requests)} accent="success"
          icon={<CheckCircle2 className="size-4" />} sub={`${pct(s.fulfillment_rate)} fulfillment`} />
        <KpiCard title="Rejected" value={fmt(s.rejected_requests)} accent="danger"
          icon={<XCircle className="size-4" />} sub={`${pct(s.rejection_rate)} rejection`} />
        <KpiCard title="Avg Resolution" value={hours(s.avg_lead_time_hours)} accent="accent"
          icon={<Clock className="size-4" />} sub={`Cycle: ${hours(s.avg_cycle_time_hours)}`} />
      </div>

      {/* Row 2 — resources */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard title="Allocated CPU" value={`${fmt(s.allocated_cpu_vcpu)} vCPU`} accent="primary"
          icon={<Cpu className="size-4" />}
          sub={`Requested: ${fmt(s.requested_cpu_vcpu)} vCPU`}
          children={<SparkArea data={d.trend} dataKey="cpu" color={CHART_COLORS[0]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'cpu', name: 'CPU vCPU' }]} />} />
        <KpiCard title="Allocated RAM" value={fmt(s.allocated_ram_gb, { unit: 'GB' })} accent="accent"
          icon={<MemoryStick className="size-4" />}
          sub={`Requested: ${fmt(s.requested_ram_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="ram" color={CHART_COLORS[1]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'ram', name: 'RAM GB' }]} />} />
        <KpiCard title="Allocated Storage" value={fmt(s.allocated_storage_gb, { unit: 'GB' })} accent="success"
          icon={<HardDrive className="size-4" />}
          sub={`Requested: ${fmt(s.requested_storage_gb, { unit: 'GB' })}`}
          children={<SparkArea data={d.trend} dataKey="storage" color={CHART_COLORS[2]} />}
          expanded={<TrendArea data={d.trend} keys={[{ key: 'storage', name: 'Storage GB' }]} />} />
      </div>

      {/* Row 3 — Trend (big) */}
      <div className="rounded-2xl border border-border bg-card/70 glass p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold">Resource Consumption Trend</h2>
          <span className="text-xs text-muted-foreground">Monthly</span>
        </div>
        <TrendArea data={d.trend} height={300} keys={[
          { key: 'requests', name: 'Requests' },
          { key: 'cpu', name: 'CPU vCPU', color: CHART_COLORS[3] },
          { key: 'ram', name: 'RAM GB', color: CHART_COLORS[4] },
          { key: 'storage', name: 'Storage GB', color: CHART_COLORS[5] },
        ]} />
      </div>

      {/* Row 4 — breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 glass p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><Building2 className="size-4" /> Top Departments (Requests)</h3>
          <HBar data={d.top_departments_by_requests} />
        </div>
        <div className="rounded-2xl border border-border bg-card/70 glass p-5">
          <h3 className="font-semibold mb-2">By Environment</h3>
          <Donut data={d.by_environment} />
        </div>
        <div className="rounded-2xl border border-border bg-card/70 glass p-5">
          <h3 className="font-semibold mb-2">By Status</h3>
          <Donut data={d.by_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 glass p-5">
          <h3 className="font-semibold mb-2">Top Departments by RAM (GB)</h3>
          <HBar data={d.top_departments_by_ram} />
        </div>
        <div className="rounded-2xl border border-border bg-card/70 glass p-5">
          <h3 className="font-semibold mb-2">Requests by Type</h3>
          <VBar data={d.by_request_type.map((r: any) => ({ name: r.label, value: r.value }))} />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ err }: { err: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <h2 className="text-lg font-semibold mb-2">No data yet</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a Jira export to populate dashboards.
        <br />
        <span className="text-xs">({err})</span>
      </p>
      <a href="/upload" className="inline-block h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium">
        Go to Upload
      </a>
    </div>
  )
}
