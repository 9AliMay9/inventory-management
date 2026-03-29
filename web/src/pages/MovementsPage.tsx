import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createMovement, listMovements } from '@/api/stock'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { movementVariant } from '@/lib/inventory'
import type { CreateMovementInput, StockMovement } from '@/types/api'

const initialForm: CreateMovementInput = {
  material_id: 0,
  movement_type: 'IN',
  quantity: '',
  unit_price: '',
  reference_no: '',
  remark: '',
}

function MovementsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function MovementsPage() {
  const { t } = useTranslation()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [materialIdFilter, setMaterialIdFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUST'>('ALL')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')

  const fetchMovements = useCallback(() => {
    setLoading(true)
    setError(null)
    listMovements({
      material_id: materialIdFilter ? Number.parseInt(materialIdFilter, 10) : undefined,
      movement_type: typeFilter === 'ALL' ? undefined : typeFilter,
      from: fromFilter || undefined,
      to: toFilter || undefined,
    })
      .then((response) => setMovements(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [fromFilter, materialIdFilter, t, toFilter, typeFilter])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createMovement({
        material_id: Number(form.material_id),
        movement_type: form.movement_type,
        quantity: form.quantity.trim(),
        unit_price: form.unit_price.trim(),
        reference_no: form.reference_no?.trim() || undefined,
        remark: form.remark?.trim() || undefined,
      })
      setOpen(false)
      setForm(initialForm)
      fetchMovements()
      toast.success(t('movements.createSuccess'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      toast.error(error.response?.data?.error ?? t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <MovementsSkeleton />
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <PageSection
      title={t('movements.title')}
      description={t('movements.description')}
      icon={ArrowLeftRight}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('movements.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t('movements.create')}</DialogTitle>
              <DialogDescription>{t('movements.createDescription')}</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="movement-material-id">{t('movements.materialId')}</Label>
                <Input
                  id="movement-material-id"
                  type="number"
                  value={form.material_id || ''}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, material_id: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('movements.type')}</Label>
                <Select
                  value={form.movement_type}
                  onValueChange={(value: 'IN' | 'OUT' | 'ADJUST') =>
                    setForm((prev) => ({ ...prev, movement_type: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">{t('movements.types.IN')}</SelectItem>
                    <SelectItem value="OUT">{t('movements.types.OUT')}</SelectItem>
                    <SelectItem value="ADJUST">{t('movements.types.ADJUST')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-quantity">{t('movements.quantity')}</Label>
                <Input
                  id="movement-quantity"
                  value={form.quantity}
                  onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-unit-price">{t('movements.unitPrice')}</Label>
                <Input
                  id="movement-unit-price"
                  value={form.unit_price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, unit_price: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-reference">{t('movements.referenceNo')}</Label>
                <Input
                  id="movement-reference"
                  value={form.reference_no}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reference_no: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-remark">{t('movements.remark')}</Label>
                <Input
                  id="movement-remark"
                  value={form.remark}
                  onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.confirm')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4 md:grid-cols-4">
        <Input
          type="number"
          placeholder={t('movements.materialId')}
          value={materialIdFilter}
          onChange={(event) => setMaterialIdFilter(event.target.value)}
        />
        <Select value={typeFilter} onValueChange={(value: 'ALL' | 'IN' | 'OUT' | 'ADJUST') => setTypeFilter(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('movements.filterType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('common.all')}</SelectItem>
            <SelectItem value="IN">{t('movements.types.IN')}</SelectItem>
            <SelectItem value="OUT">{t('movements.types.OUT')}</SelectItem>
            <SelectItem value="ADJUST">{t('movements.types.ADJUST')}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={fromFilter} onChange={(event) => setFromFilter(event.target.value)} />
        <Input type="date" value={toFilter} onChange={(event) => setToFilter(event.target.value)} />
      </div>

      {movements.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title={t('movements.empty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('movements.type')}</TableHead>
                  <TableHead>{t('movements.materialId')}</TableHead>
                  <TableHead>{t('movements.quantity')}</TableHead>
                  <TableHead>{t('movements.unitPrice')}</TableHead>
                  <TableHead>{t('movements.referenceNo')}</TableHead>
                  <TableHead>{t('movements.remark')}</TableHead>
                  <TableHead>{t('movements.operatorId')}</TableHead>
                  <TableHead>{t('common.time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Badge variant={movementVariant(movement.movement_type)}>
                        {t(`movements.types.${movement.movement_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.material_id}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.unit_price}</TableCell>
                    <TableCell>{movement.reference_no ?? t('common.none')}</TableCell>
                    <TableCell>{movement.remark ?? t('common.none')}</TableCell>
                    <TableCell>{movement.operator_id ?? t('common.none')}</TableCell>
                    <TableCell>{new Date(movement.created_at).toLocaleString()}</TableCell>
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
