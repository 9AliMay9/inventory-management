import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Logs, TriangleAlert } from 'lucide-react'
import { listAlertFailures } from '@/api/alert-failures'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AlertFailure } from '@/types/api'

function AlertFailuresSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

export default function AlertFailuresPage() {
  const { t } = useTranslation()
  const [failures, setFailures] = useState<AlertFailure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAlertFailures()
      .then((response) => setFailures(response.data))
      .catch((err) => {
        const error = err as AxiosError<{ error?: string }>
        setError(error.response?.data?.error ?? t('common.error'))
      })
      .finally(() => setLoading(false))
  }, [t])

  return (
    <PageSection
      title={t('alerts.failuresTitle')}
      description={t('alerts.failuresDescription')}
      icon={Logs}
      action={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link to="/alerts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('alerts.backToAlerts')}
          </Link>
        </Button>
      }
    >
      {loading ? (
        <AlertFailuresSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : failures.length === 0 ? (
        <EmptyState icon={TriangleAlert} title={t('alerts.failuresEmpty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.type')}</TableHead>
                  <TableHead>{t('alerts.materialId')}</TableHead>
                  <TableHead>{t('alerts.failureError')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failures.map((failure) => (
                  <TableRow key={failure.id}>
                    <TableCell>
                      <Badge variant={failure.alert_type === 'LOW_STOCK' ? 'destructive' : 'secondary'}>
                        {t(`alerts.types.${failure.alert_type}`, { defaultValue: failure.alert_type })}
                      </Badge>
                    </TableCell>
                    <TableCell>{failure.material_id ?? t('common.none')}</TableCell>
                    <TableCell className="max-w-[40rem] whitespace-normal break-words">{failure.error}</TableCell>
                    <TableCell>{new Date(failure.created_at).toLocaleString()}</TableCell>
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
