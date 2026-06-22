export function CapacityPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Capacity Management</h1>
        <p className="text-sm text-muted-foreground">
          Allocated (from Jira) vs Available (Capacity Registry) — Phase 2.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        <strong className="text-foreground">Phase 2 module.</strong>
        <p className="mt-2">
          The data model and API endpoint <code>/api/capacity</code> are wired and ready to receive
          manual inventory entries (datacenter / cluster / hypervisor / env / CPU&nbsp;total/used/free, etc).
          The MVP focuses on demand-side analytics from Jira; capacity-vs-allocated comparison,
          utilization %, exhaustion forecast and purchase planning land in Phase 2.
        </p>
      </div>
    </div>
  )
}
