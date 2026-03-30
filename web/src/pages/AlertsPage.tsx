import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Logs, ShieldCheck, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { listAlerts, resolveAlert } from '@/api/alerts'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Alert } from '@/types/api'

function AlertsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

export default function AlertsPage() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvingIds, setResolvingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    setLoading(true)
    setError(null)
    listAlerts()
      .then((response) => setAlerts(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  async function handleResolve(id: number) {
    setResolvingIds((prev) => new Set(prev).add(id))
    try {
      await resolveAlert(id)
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      toast.success(t('alerts.resolveSuccess'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      toast.error(error.response?.data?.error ?? t('alerts.resolveFailed'))
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <PageSection
      title={t('alerts.title')}
      description={t('alerts.description')}
      icon={TriangleAlert}
      action={
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-primary/25 bg-primary/8 text-primary hover:border-primary/35 hover:bg-primary/14 hover:text-primary"
        >
          <Link to="/alert-failures">
            <Logs className="mr-2 h-4 w-4" />
            {t('alerts.viewFailures')}
          </Link>
        </Button>
      }
    >
      {loading ? (
        <AlertsSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : alerts.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t('alerts.empty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.type')}</TableHead>
                  <TableHead>{t('alerts.materialId')}</TableHead>
                  <TableHead>{t('alerts.message')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge variant={alert.alert_type === 'LOW_STOCK' ? 'destructive' : 'secondary'}>
                        {t(`alerts.types.${alert.alert_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.material_id}</TableCell>
                    <TableCell className="max-w-[32rem] whitespace-normal">{alert.message}</TableCell>
                    <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resolvingIds.has(alert.id)}
                        onClick={() => void handleResolve(alert.id)}
                      >
                        {resolvingIds.has(alert.id) ? t('alerts.resolving') : t('alerts.resolve')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageSection>
  )
}
