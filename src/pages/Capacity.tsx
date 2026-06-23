import { useI18n } from '@/lib/i18n'

export function CapacityPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('cap.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('cap.subtitle')}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        <strong className="text-foreground">{t('cap.phase2_note')}</strong>
        <p className="mt-2">{t('cap.phase2_body')}</p>
      </div>
    </div>
  )
}
