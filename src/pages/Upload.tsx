import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, History, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useFilters } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'

export function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { refreshOptions } = useFilters()
  const { t } = useI18n()
  const [report, setReport] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const refresh = () => api.uploads().then(setHistory).catch(() => {})
  useEffect(() => { refresh() }, [])

  const doUpload = async (file: File) => {
    setBusy(true)
    try {
      const r = await api.upload(file)
      setReport(r.report)
      toast.success(t('up.ingested', { n: r.report.rows_valid, f: file.name }))
      await refresh()
      await refreshOptions()
    } catch (e: any) {
      toast.error(t('up.upload_failed', { e: e?.message || e }))
    } finally {
      setBusy(false)
    }
  }

  const activate = async (id: string) => {
    await api.activate(id)
    toast.success(t('up.activated'))
    await refresh()
    await refreshOptions()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('up.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('up.subtitle')}</p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) await doUpload(f)
        }}
        className="rounded-2xl border-2 border-dashed border-border bg-card/40 p-10 text-center cursor-pointer hover:border-[var(--primary)] transition"
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".xls,.xlsx,.csv,.tsv,.html" className="hidden"
          onChange={(e) => e.target.files?.[0] && doUpload(e.target.files[0])} />
        <FileSpreadsheet className="size-10 mx-auto text-[var(--primary)] mb-3" />
        <div className="font-medium">{busy ? t('up.busy') : t('up.drop')}</div>
      </div>

      {report && (
        <div className="itrm-card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[var(--success)]" /> {t('up.report')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label={t('up.format')}        v={report.format} />
            <Stat label={t('up.rows_in_file')}  v={report.rows_in_file} />
            <Stat label={t('up.valid')}         v={report.rows_valid} />
            <Stat label={t('up.quarantined')}   v={report.rows_quarantined} />
            <Stat label={t('up.req_types')}     v={report.distinct_request_types} />
            <Stat label={t('up.depts')}         v={report.department_count} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <div>
              <h3 className="text-sm font-medium mb-2">{t('up.status_counts')}</h3>
              <KvList obj={report.status_counts} />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">{t('up.req_type_counts')}</h3>
              <KvList obj={report.request_type_counts} />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">{t('up.top_depts')}</h3>
              <KvList obj={report.top_departments} max={10} />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">{t('up.columns_mapped')}</h3>
              <KvList obj={report.columns_mapped} max={20} />
            </div>
          </div>
        </div>
      )}

      <div className="itrm-card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><History className="size-4" /> {t('up.history')}</h2>
        {history.length === 0 && <div className="text-sm text-muted-foreground">{t('up.no_uploads')}</div>}
        <table className="w-full text-sm">
          <tbody>
            {history.slice().reverse().map((u) => (
              <tr key={u.upload_id} className="border-b border-border/60">
                <td className="py-2 pr-3 font-mono text-xs">{u.upload_id}</td>
                <td className="py-2 pr-3">{u.filename}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">{u.format}</td>
                <td className="py-2 pr-3 text-xs">{u.rows_valid} {t('up.valid').toLowerCase()}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">{u.uploaded_at}</td>
                <td className="py-2 pr-3 text-right">
                  {u.is_active ? (
                    <span className="text-[var(--success)] font-medium">● {t('up.active')}</span>
                  ) : (
                    <button onClick={() => activate(u.upload_id)}
                      className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">
                      {t('up.activate')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, v }: { label: string; v: any }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tracking-tight">{v ?? '—'}</div>
    </div>
  )
}

function KvList({ obj, max = 8 }: { obj?: Record<string, any>; max?: number }) {
  const entries = Object.entries(obj || {}).slice(0, max)
  return (
    <ul className="text-sm space-y-1">
      {entries.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-3 border-b border-border/60 py-1">
          <span className="text-muted-foreground truncate max-w-[60%]" title={k}>{k}</span>
          <span className="font-medium">{String(v)}</span>
        </li>
      ))}
    </ul>
  )
}
