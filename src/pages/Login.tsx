import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { Sparkles, Eye, EyeOff, Wifi, Smartphone } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useI18n, Lang } from '@/lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
]

export function LoginPage() {
  const { lang, setLang, t } = useI18n()
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation() as any
  const [u, setU] = useState('admin')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [lan, setLan] = useState<{ ip: string; url: string } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch LAN URL once and render QR.
  useEffect(() => {
    fetch('/api/lan-info').then((r) => r.json()).then((info) => {
      setLan(info)
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, info.url, {
          width: 220,
          margin: 1,
          color: { dark: '#1a2030', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      await login(u, p)
      nav(loc.state?.from?.pathname || '/', { replace: true })
    } catch (e: any) {
      setErr(t('login.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10"
         style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md space-y-5">
        {/* language switcher floating top-right */}
        <div className="flex items-center justify-end">
          <div className="flex items-center rounded-xl border border-[var(--glass-border)] glass-soft overflow-hidden">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`px-2.5 h-9 text-xs font-medium transition ${
                  lang === l.code ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-white/40 dark:hover:bg-white/5'
                }`}>{l.label}</button>
            ))}
          </div>
        </div>

        {/* brand */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="size-14 rounded-2xl grid place-items-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)' }}>
            <Sparkles className="size-7" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight">ITRM</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
              IT Resource Management
            </div>
          </div>
        </div>

        {/* login card */}
        <form onSubmit={submit} className="itrm-card p-6 space-y-4">
          <div>
            <h1 className="text-lg font-semibold">{t('login.title')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('login.subtitle')}</p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('login.username')}
              </span>
              <input
                value={u}
                onChange={(e) => setU(e.target.value)}
                autoFocus
                className="mt-1 w-full h-11 rounded-xl border border-border bg-[var(--input-background)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('login.password')}
              </span>
              <div className="relative mt-1">
                <input
                  type={show ? 'text' : 'password'}
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-[var(--input-background)] px-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
                <button type="button" onClick={() => setShow((v) => !v)}
                  className="absolute right-1 top-1 size-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
          </div>

          {err && (
            <div className="text-xs px-3 py-2 rounded-lg border border-[var(--danger)] text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]">
              {err}
            </div>
          )}

          <button type="submit" disabled={busy || !p}
            className="w-full h-11 rounded-xl text-white font-medium shadow-[0_2px_10px_rgba(45,122,95,0.35)] disabled:opacity-60"
            style={{ background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-soft) 130%)' }}>
            {busy ? '…' : t('login.submit')}
          </button>

          <div className="text-[11px] text-muted-foreground text-center pt-1">
            {t('login.default_hint')}
          </div>
        </form>

        {/* QR for mobile access */}
        <div className="itrm-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="size-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">{t('login.qr_title')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white p-2 shrink-0 shadow-sm">
              <canvas ref={canvasRef} width={220} height={220} />
            </div>
            <div className="text-xs text-muted-foreground space-y-2 min-w-0">
              <p>{t('login.qr_help')}</p>
              {lan && (
                <div className="flex items-center gap-1.5 font-mono text-[var(--primary)] break-all">
                  <Wifi className="size-3.5 shrink-0" />
                  <span>{lan.url}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
