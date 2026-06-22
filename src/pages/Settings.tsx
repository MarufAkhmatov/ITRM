import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function SettingsPage() {
  const [rates, setRates] = useState<any>(null)
  useEffect(() => {
    fetch('/api/cost-rates').then((r) => r.json()).then(setRates).catch(() => setRates({}))
  }, [])
  const save = async () => {
    await fetch('/api/cost-rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates),
    })
    toast.success('Cost rates saved')
  }
  if (!rates) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">FinOps cost rates and admin configuration.</p>
      </div>

      <div className="itrm-card p-5 space-y-4">
        <h2 className="font-semibold">FinOps unit rates (monthly, USD)</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="CPU per vCPU / month" value={rates.cpu_per_vcpu_month}
            onChange={(v) => setRates({ ...rates, cpu_per_vcpu_month: v })} />
          <Field label="RAM per GB / month" value={rates.ram_per_gb_month}
            onChange={(v) => setRates({ ...rates, ram_per_gb_month: v })} />
          <Field label="Storage per GB / month" value={rates.storage_per_gb_month}
            onChange={(v) => setRates({ ...rates, storage_per_gb_month: v })} />
        </div>
        <h3 className="font-medium pt-2">Environment multiplier</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {Object.entries(rates.env_multiplier || {}).map(([k, v]: any) => (
            <Field key={k} label={k} value={v}
              onChange={(nv) => setRates({ ...rates, env_multiplier: { ...rates.env_multiplier, [k]: nv } })} />
          ))}
        </div>
        <button onClick={save}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium">
          Save rates
        </button>
      </div>

      <div className="itrm-card p-5">
        <h2 className="font-semibold">Field Mappings</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Column auto-mapping and value normalization (status, department, request-type, environment, server-type)
          run from the dictionaries in <code>backend/ingest/mappings.py</code>. Phase 2 will add an
          admin UI here to edit these without code changes.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: any; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="number" step="0.01" value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 rounded-lg border border-border bg-card px-2 text-sm" />
    </label>
  )
}
