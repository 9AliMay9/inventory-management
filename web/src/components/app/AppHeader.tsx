import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import ThemeSwitcher from '@/components/app/ThemeSwitcher'

const titleMap: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/suppliers': 'nav.suppliers',
  '/materials': 'nav.materials',
  '/stock/movements': 'nav.movements',
  '/alerts': 'nav.alerts',
  '/stocktaking': 'nav.stocktaking',
  '/reports/monthly': 'nav.reports',
  '/users': 'nav.users',
}

export default function AppHeader() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isZh = i18n.language.startsWith('zh')

  const title = useMemo(() => {
    if (location.pathname.startsWith('/materials/')) {
      return t('materialDetail.title')
    }
    if (location.pathname.startsWith('/stocktaking/') && location.pathname !== '/stocktaking') {
      return t('stocktaking.detail')
    }
    const key = titleMap[location.pathname] ?? 'nav.dashboard'
    return t(key)
  }, [location.pathname, t])

  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 px-8 py-5 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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
    </header>
  )
}
