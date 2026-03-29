import { LayoutDashboard, Package, ScrollText, TriangleAlert, ClipboardList, ChartColumn, Truck, Users } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/suppliers', label: 'nav.suppliers', icon: Truck },
  { to: '/materials', label: 'nav.materials', icon: Package },
  { to: '/stock/movements', label: 'nav.movements', icon: ScrollText },
  { to: '/alerts', label: 'nav.alerts', icon: TriangleAlert },
  { to: '/stocktaking', label: 'nav.stocktaking', icon: ClipboardList },
  { to: '/reports/monthly', label: 'nav.reports', icon: ChartColumn },
  { to: '/users', label: 'nav.users', icon: Users, adminOnly: true },
]

export default function AppSidebar() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-[color:var(--sidebar-border)] bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)]">
      <div className="px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            IM
          </div>
          <div>
            <div className="text-sm font-medium">{t('app.name')}</div>
            <div className="text-xs text-[color:var(--sidebar-foreground)]/55">v1.0</div>
          </div>
        </div>
      </div>

      <Separator className="bg-[color:var(--sidebar-border)]" />

      <nav className="flex-1 space-y-1 px-4 py-5">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') {
            return null
          }

          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-[color:var(--sidebar-foreground)]/84 hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.label)}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-2xl border border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-accent)]/50 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[color:var(--sidebar-border)]">
              <AvatarFallback className="bg-transparent text-[color:var(--sidebar-foreground)]">
                {user?.username?.slice(0, 2).toUpperCase() ?? 'NA'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.username ?? 'Guest'}</p>
              <Badge
                variant="secondary"
                className="mt-1 border-0 bg-white/10 text-[color:var(--sidebar-foreground)]"
              >
                {user?.role ?? 'staff'}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full justify-center bg-white/10 text-[color:var(--sidebar-foreground)] hover:bg-white/15"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </aside>
  )
}
