import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { createStocktaking, listStocktaking } from '@/api/stocktaking'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CreateStocktakingInput, Stocktaking } from '@/types/api'

const initialForm: CreateStocktakingInput = {
  period: '',
  remark: '',
}

function StocktakingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

export default function StocktakingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [records, setRecords] = useState<Stocktaking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [periodError, setPeriodError] = useState<string | null>(null)

  const fetchRecords = useCallback(() => {
    setLoading(true)
    setError(null)
    listStocktaking()
      .then((response) => setRecords(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.period.trim().length > 20) {
      setPeriodError(t('stocktaking.periodTooLong'))
      return
    }
    setPeriodError(null)
    setSubmitting(true)
    try {
      await createStocktaking({
        period: form.period.trim(),
        remark: form.remark?.trim() || undefined,
      })
      setOpen(false)
      setForm(initialForm)
      fetchRecords()
      toast.success(t('stocktaking.createSuccess'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageSection
      title={t('stocktaking.title')}
      description={t('stocktaking.description')}
      icon={ClipboardList}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('stocktaking.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('stocktaking.create')}</DialogTitle>
              <DialogDescription>{t('stocktaking.createDescription')}</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="stocktaking-period">{t('stocktaking.period')}</Label>
                <Input
                  id="stocktaking-period"
                  value={form.period}
                  onChange={(event) => setForm((prev) => ({ ...prev, period: event.target.value }))}
                />
                {periodError ? <p className="text-xs text-destructive">{periodError}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stocktaking-remark">{t('stocktaking.remark')}</Label>
                <Input
                  id="stocktaking-remark"
                  value={form.remark}
                  onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('common.loading') : t('common.confirm')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <StocktakingSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : records.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t('stocktaking.empty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.id')}</TableHead>
                  <TableHead>{t('stocktaking.period')}</TableHead>
                  <TableHead>{t('stocktaking.statusLabel')}</TableHead>
                  <TableHead>{t('stocktaking.operatorId')}</TableHead>
                  <TableHead>{t('stocktaking.remark')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.period}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'confirmed' ? 'success' : 'outline'}>
                        {t(`stocktaking.status.${record.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.operator_id ?? t('common.none')}</TableCell>
                    <TableCell>{record.remark ?? t('common.none')}</TableCell>
                    <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/stocktaking/${record.id}`)}>
                        {t('stocktaking.viewDetail')}
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
