import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ClipboardList, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  addStocktakingItem,
  confirmStocktaking,
  getStocktaking,
  getStocktakingItems,
} from '@/api/stocktaking'
import PageSection from '@/components/app/PageSection'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AddStocktakingItemInput, Stocktaking, StocktakingItem } from '@/types/api'

const initialItemForm: AddStocktakingItemInput = {
  material_id: 0,
  book_quantity: '',
  actual_quantity: '',
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  )
}

export default function StocktakingDetailPage() {
  const { id } = useParams()
  const stocktakingId = Number(id)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [record, setRecord] = useState<Stocktaking | null>(null)
  const [items, setItems] = useState<StocktakingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [form, setForm] = useState(initialItemForm)

  const fetchDetail = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([getStocktaking(stocktakingId), getStocktakingItems(stocktakingId)])
      .then(([detail, detailItems]) => {
        setRecord(detail.data)
        setItems(detailItems.data)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [stocktakingId, t])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await addStocktakingItem(stocktakingId, {
        material_id: Number(form.material_id),
        book_quantity: form.book_quantity.trim(),
        actual_quantity: form.actual_quantity.trim(),
      })
      setOpen(false)
      setForm(initialItemForm)
      fetchDetail()
      toast.success(t('stocktaking.addItemSuccess'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      await confirmStocktaking(stocktakingId)
      fetchDetail()
      toast.success(t('stocktaking.confirmSuccess'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      if (error.response?.status === 409) {
        toast.error(t('stocktaking.alreadyConfirmed'))
      } else {
        toast.error(error.response?.data?.error ?? t('common.error'))
      }
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (error || !record) {
    return <div className="text-sm text-destructive">{error ?? t('common.error')}</div>
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/stocktaking')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('stocktaking.back')}
      </Button>

      <PageSection title={t('stocktaking.detail')} description={`ID #${record.id}`} icon={ClipboardList}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">{t('stocktaking.period')}</p>
            <p className="mt-2 font-medium">{record.period}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('stocktaking.statusLabel')}</p>
            <Badge className="mt-2" variant={record.status === 'confirmed' ? 'success' : 'outline'}>
              {t(`stocktaking.status.${record.status}`)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('stocktaking.operatorId')}</p>
            <p className="mt-2 font-medium">{record.operator_id ?? t('common.none')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('stocktaking.remark')}</p>
            <p className="mt-2 font-medium">{record.remark ?? t('common.none')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('stocktaking.recordedAt')}</p>
            <p className="mt-2 font-medium">{new Date(record.created_at).toLocaleString()}</p>
          </div>
        </div>
      </PageSection>

      <PageSection
        title={t('stocktaking.itemsTitle')}
        description={t('stocktaking.detailDescription')}
        action={
          record.status === 'draft' ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('stocktaking.addItem')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('stocktaking.addItem')}</DialogTitle>
                  <DialogDescription>{t('stocktaking.addItemDescription')}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleAddItem}>
                  <div className="space-y-2">
                    <Label htmlFor="detail-material-id">{t('alerts.materialId')}</Label>
                    <Input
                      id="detail-material-id"
                      type="number"
                      value={form.material_id || ''}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, material_id: Number(event.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-book">{t('stocktaking.bookQuantity')}</Label>
                    <Input
                      id="detail-book"
                      value={form.book_quantity}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, book_quantity: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-actual">{t('stocktaking.actualQuantity')}</Label>
                    <Input
                      id="detail-actual"
                      value={form.actual_quantity}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, actual_quantity: event.target.value }))
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? t('common.loading') : t('common.confirm')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null
        }
      >
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('alerts.materialId')}</TableHead>
                  <TableHead>{t('stocktaking.bookQuantity')}</TableHead>
                  <TableHead>{t('stocktaking.actualQuantity')}</TableHead>
                  <TableHead>{t('stocktaking.difference')}</TableHead>
                  <TableHead>{t('stocktaking.recordedAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.material_id}</TableCell>
                    <TableCell>{item.book_quantity}</TableCell>
                    <TableCell>{item.actual_quantity}</TableCell>
                    <TableCell>{item.difference ?? t('common.none')}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {record.status === 'draft' ? (
          <div className="mt-6 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t('stocktaking.confirm')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('stocktaking.confirm')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('stocktaking.confirmWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => void handleConfirm()}>
                    {confirming ? t('common.loading') : t('common.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </PageSection>
    </div>
  )
}
