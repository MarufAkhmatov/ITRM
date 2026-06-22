import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { fmt } from '@/lib/format'
import { HBar, Heatmap } from '@/components/charts/Charts'

export function DepartmentsPage() {
  const { filters } = useFilters()
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    api.departments(filters).then(setD).catch(() => setD(null))
  }, [JSON.stringify(filters)])
  if (!d) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Department Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Consumption, growth and ranking across {d.rows.length} departments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">Top by Requests</h3>
          <HBar data={d.rows.slice(0, 10).map((r: any) => ({ name: r.department, value: r.requests }))} />
        </div>
        <div className="itrm-card p-5">
          <h3 className="font-semibold mb-2">Top by RAM (GB)</h3>
          <HBar data={[...d.rows].sort((a, b) => b.ram_gb - a.ram_gb).slice(0, 10)
            .map((r: any) => ({ name: r.department, value: r.ram_gb }))} />
        </div>
      </div>

      <div className="itrm-card p-5">
        <h3 className="font-semibold mb-3">Department × Month Heatmap (top 15 departments)</h3>
        <Heatmap rows={d.top_departments} cols={d.months} data={d.heatmap}
          rowKey="department" colKey="month" valueKey="value" />
      </div>

      <div className="itrm-card p-5 overflow-x-auto">
        <h3 className="font-semibold mb-3">All Departments</h3>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3">Department</th>
              <th className="text-right py-2 pr-3">Requests</th>
              <th className="text-right py-2 pr-3">CPU vCPU</th>
              <th className="text-right py-2 pr-3">RAM GB</th>
              <th className="text-right py-2 pr-3">Storage GB</th>
              <th className="text-left py-2 pr-3">Top Env</th>
              <th className="text-left py-2 pr-3">Top Request Type</th>
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
