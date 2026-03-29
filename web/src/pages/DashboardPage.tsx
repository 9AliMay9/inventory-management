import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Boxes, Package, TriangleAlert } from 'lucide-react'
import { listAlerts } from '@/api/alerts'
import { listMaterials } from '@/api/materials'
import { listMovements } from '@/api/stock'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getStockStatus, isToday, movementVariant } from '@/lib/inventory'
import type { Alert, Material, StockMovement } from '@/types/api'

interface DashboardData {
  materials: Material[]
  alerts: Alert[]
  movements: StockMovement[]
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(() => {
    setLoading(true)
    setError(null)

    Promise.all([listMaterials(), listAlerts(), listMovements()])
      .then(([materials, alerts, movements]) =>
        setData({
          materials: materials.data,
          alerts: alerts.data,
          movements: movements.data,
        })
      )
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-sm text-destructive">
        {error ?? t('common.error')}
      </div>
    )
  }

  const lowStockCount = data.materials.filter((material) => getStockStatus(material) === 'low').length
  const todayMovements = data.movements.filter((movement) => isToday(movement.created_at)).length

  const cards = [
    {
      title: t('dashboard.totalMaterials'),
      value: data.materials.length,
      icon: Package,
      tone: 'text-primary',
    },
    {
      title: t('dashboard.lowStock'),
      value: lowStockCount,
      icon: TriangleAlert,
      tone: 'text-destructive',
    },
    {
      title: t('dashboard.unresolvedAlerts'),
      value: data.alerts.length,
      icon: Bell,
      tone: data.alerts.length > 0 ? 'text-destructive' : 'text-primary',
    },
    {
      title: t('dashboard.todayMovements'),
      value: todayMovements,
      icon: Boxes,
      tone: 'text-primary',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="flex items-start justify-between px-6 py-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Icon className={`h-5 w-5 ${card.tone}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PageSection
          title={t('dashboard.recentAlerts')}
          description={t('dashboard.unresolvedAlerts')}
          icon={Bell}
        >
          {data.alerts.length === 0 ? (
            <EmptyState icon={Bell} title={t('dashboard.noAlerts')} />
          ) : (
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant={alert.alert_type === 'LOW_STOCK' ? 'destructive' : 'secondary'}>
                      {alert.alert_type}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-6">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection
          title={t('dashboard.recentMovements')}
          description={t('dashboard.todayMovements')}
          icon={Boxes}
        >
          {data.movements.length === 0 ? (
            <EmptyState icon={Boxes} title={t('dashboard.noMovements')} />
          ) : (
            <div className="space-y-3">
              {data.movements.slice(0, 8).map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={movementVariant(movement.movement_type)}>
                        {movement.movement_type}
                      </Badge>
                      <span className="text-sm font-medium">Material #{movement.material_id}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {movement.quantity} · {new Date(movement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </div>
  )
}
