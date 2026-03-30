import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Boxes, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createMaterial, listMaterials } from '@/api/materials'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getStockStatus } from '@/lib/inventory'
import type { CreateMaterialInput, Material } from '@/types/api'

const initialForm: CreateMaterialInput = {
  code: '',
  name: '',
  category: '',
  unit: '',
  specification: '',
  quantity: '0.00',
  min_stock: '',
  max_stock: '',
  unit_price: '',
}

const materialFields = [
  ['code', 'materials.code'],
  ['name', 'materials.name'],
  ['category', 'materials.category'],
  ['unit', 'materials.unit'],
  ['specification', 'materials.specification'],
  ['supplier_id', 'materials.supplierId'],
  ['quantity', 'materials.quantity'],
  ['min_stock', 'materials.minStock'],
  ['max_stock', 'materials.maxStock'],
  ['unit_price', 'materials.unitPrice'],
] as const

function MaterialsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-3xl" />
        ))}
      </div>
    </div>
  )
}

export default function MaterialsPage() {
  const { t } = useTranslation()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [nameFilter, setNameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierIdFilter, setSupplierIdFilter] = useState('')

  const fetchMaterials = useCallback(() => {
    setLoading(true)
    setError(null)
    listMaterials({
      name: nameFilter || undefined,
      category: categoryFilter || undefined,
      supplier_id: supplierIdFilter ? Number.parseInt(supplierIdFilter, 10) : undefined,
    })
      .then((response) => setMaterials(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [categoryFilter, nameFilter, supplierIdFilter, t])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchMaterials])

  function validateForm() {
    if (!form.code.trim()) return t('materials.validation.codeRequired')
    if (!form.name.trim()) return t('materials.validation.nameRequired')
    if (!form.unit.trim()) return t('materials.validation.unitRequired')

    const minStock = Number.parseFloat(form.min_stock)
    if (Number.isNaN(minStock) || minStock < 0) {
      return t('materials.validation.minStockInvalid')
    }

    const quantity = Number.parseFloat(form.quantity)
    if (Number.isNaN(quantity)) {
      return t('materials.validation.quantityInvalid')
    }

    const unitPrice = Number.parseFloat(form.unit_price)
    if (Number.isNaN(unitPrice)) {
      return t('materials.validation.unitPriceInvalid')
    }

    if (form.max_stock?.trim()) {
      const maxStock = Number.parseFloat(form.max_stock)
      if (Number.isNaN(maxStock) || maxStock <= 0) {
        return t('materials.validation.maxStockInvalid')
      }
      if (minStock >= maxStock) {
        return t('materials.validation.stockRangeInvalid')
      }
    }

    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }
    setSubmitting(true)
    try {
      await createMaterial({
        code: form.code.trim(),
        name: form.name.trim(),
        category: form.category?.trim() || undefined,
        unit: form.unit.trim(),
        specification: form.specification?.trim() || undefined,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : undefined,
        quantity: form.quantity.trim(),
        min_stock: form.min_stock.trim(),
        max_stock: form.max_stock?.trim() || undefined,
        unit_price: form.unit_price.trim(),
      })
      setOpen(false)
      setForm(initialForm)
      fetchMaterials()
      toast.success(t('materials.createSuccess'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      toast.error(error.response?.data?.error ?? t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <MaterialsSkeleton />
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      <PageSection
        title={t('materials.title')}
        description={t('materials.description')}
        icon={Boxes}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('materials.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('materials.create')}</DialogTitle>
                <DialogDescription>{t('materials.createDescription')}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                {materialFields.map(([field, key]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={`material-${field}`}>{t(key)}</Label>
                    <Input
                      id={`material-${field}`}
                      type={field === 'supplier_id' ? 'number' : 'text'}
                      value={form[field]?.toString() ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [field]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
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
        <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t('materials.filterName')}
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
            />
          </div>
          <Input
            placeholder={t('materials.filterCategory')}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          />
          <Input
            type="number"
            placeholder={t('materials.filterSupplier')}
            value={supplierIdFilter}
            onChange={(event) => setSupplierIdFilter(event.target.value)}
          />
        </div>
      </PageSection>

      {materials.length === 0 ? (
        <EmptyState icon={Boxes} title={t('materials.empty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[36rem] overflow-auto p-1">
            <div className="grid gap-4 p-3 lg:grid-cols-3">
              {materials.map((material) => {
                const status = getStockStatus(material)
                const badgeVariant =
                  status === 'low' ? 'destructive' : status === 'high' ? 'secondary' : 'success'

                return (
                  <div
                    key={material.id}
                    className={`rounded-3xl border border-border/70 bg-card p-5 shadow-sm ${
                      status === 'low' ? 'border-l-4 border-l-destructive' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {material.code}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">#{material.id}</p>
                        <h3 className="mt-3 text-lg font-semibold">{material.name}</h3>
                      </div>
                      <Badge variant={badgeVariant}>
                        {status === 'low'
                          ? t('materials.status.low')
                          : status === 'high'
                            ? t('materials.status.high')
                            : t('materials.status.normal')}
                      </Badge>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('materials.quantity')}</span>
                        <span className="font-medium">
                          {material.quantity} / {material.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('materials.unitPrice')}</span>
                        <span className="font-medium">{material.unit_price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('materials.category')}</span>
                        <span className="font-medium">{material.category ?? t('common.none')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('materials.supplierId')}</span>
                        <span className="font-medium">{material.supplier_id ?? t('common.none')}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border/50 pt-3">
                      <Link to={`/materials/${material.id}`} className="text-xs text-primary hover:underline">
                        {t('materials.viewDetail')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
