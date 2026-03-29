import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ThemeSwitcher from '@/components/app/ThemeSwitcher'
import { useAuthStore } from '@/store/authStore'

interface JwtPayload {
  sub: number
  role: 'admin' | 'staff'
}

function parseJwt(token: string): JwtPayload {
  const base64 = token.split('.')[1]
  const normalized = base64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(window.atob(normalized)) as JwtPayload
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isZh = i18n.language.startsWith('zh')
  const saveLogin = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await login(username, password)
      const token = response.data.token
      const payload = parseJwt(token)

      saveLogin(token, {
        id: payload.sub,
        username,
        role: payload.role,
      })

      navigate('/dashboard', { replace: true })
    } catch {
      toast.error(t('auth.loginFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section
        className="hidden rounded-[2rem] p-10 lg:flex lg:flex-col lg:justify-between"
        style={{
          background:
            'linear-gradient(160deg, var(--login-hero-start) 0%, var(--login-hero-mid) 42%, var(--login-hero-end) 100%)',
          boxShadow: '0 30px 80px var(--login-hero-shadow)',
          color: 'var(--login-hero-foreground)',
        }}
      >
        <div>
          <div
            className="inline-flex rounded-full px-4 py-1 text-xs uppercase tracking-[0.32em]"
            style={{
              border: '1px solid var(--login-hero-panel-border)',
              backgroundColor: 'var(--login-hero-panel)',
            }}
          >
            {t('auth.heroTag')}
          </div>
          <h1 className="mt-8 max-w-md text-5xl font-semibold leading-[1.02] tracking-tight">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7" style={{ color: 'var(--login-hero-muted)' }}>
            {t('auth.heroDescription')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['auth.heroCards.clarityTitle', 'auth.heroCards.clarityDescription'],
            ['auth.heroCards.traceTitle', 'auth.heroCards.traceDescription'],
            ['auth.heroCards.deliveryTitle', 'auth.heroCards.deliveryDescription'],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl p-4 backdrop-blur-sm"
              style={{
                border: '1px solid var(--login-hero-panel-border)',
                backgroundColor: 'var(--login-hero-panel)',
              }}
            >
              <p className="text-sm font-semibold">{t(title)}</p>
              <p className="mt-2 text-xs leading-6" style={{ color: 'var(--login-hero-muted)' }}>
                {t(desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Card className="border-border/70 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div
              className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: 'color-mix(in oklch, var(--primary) 16%, white)',
                color: 'var(--primary)',
              }}
            >
              {t('app.name')}
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <button
                type="button"
                onClick={() => {
                  const nextLanguage = isZh ? 'en' : 'zh-CN'
                  window.localStorage.setItem('lang', nextLanguage)
                  void i18n.changeLanguage(nextLanguage)
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {isZh ? 'EN' : 'ZH'}
              </button>
            </div>
          </div>
          <CardTitle className="text-3xl tracking-tight">{t('auth.login')}</CardTitle>
          <CardDescription>{t('auth.welcome')}</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
