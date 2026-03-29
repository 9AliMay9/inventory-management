import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Boxes } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { getMaterial } from '@/api/materials'
import { listMovements } from '@/api/stock'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getStockStatus, movementVariant } from '@/lib/inventory'
import type { Material, StockMovement } from '@/types/api'

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-36 rounded-xl" />
      <Skeleton className="h-56 rounded-3xl" />
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  )
}

export default function MaterialDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const materialId = Number(id)
  const [material, setMaterial] = useState<Material | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      const [materialRes, movementsRes] = await Promise.all([
        getMaterial(materialId),
        listMovements({ material_id: materialId }),
      ])
      setMaterial(materialRes.data)
      setMovements(movementsRes.data)
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 404) {
        setNotFound(true)
      } else {
        setError(t('materialDetail.loadFailed'))
      }
    } finally {
      setLoading(false)
    }
  }, [materialId, t])

  useEffect(() => {
    void fetchDetail()
  }, [fetchDetail])

  if (loading) {
    return <DetailSkeleton />
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link to="/materials" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t('materialDetail.back')}
        </Link>
        <EmptyState icon={Boxes} title={t('materialDetail.notFound')} />
      </div>
    )
  }

  if (error || !material) {
    return <div className="text-sm text-destructive">{error ?? t('materialDetail.loadFailed')}</div>
  }

  const status = getStockStatus(material)
  const badgeVariant =
    status === 'low' ? 'destructive' : status === 'high' ? 'secondary' : 'success'
  const badgeLabel =
    status === 'low'
      ? t('materialDetail.status.low')
      : status === 'high'
        ? t('materialDetail.status.high')
        : t('materialDetail.status.normal')

  const infoItems = [
    [t('materialDetail.fields.materialId'), `#${material.id}`],
    [t('materialDetail.fields.code'), material.code],
    [t('materialDetail.fields.name'), material.name],
    [t('materialDetail.fields.category'), material.category ?? '—'],
    [t('materialDetail.fields.unit'), material.unit],
    [t('materialDetail.fields.specification'), material.specification ?? '—'],
    [t('materialDetail.fields.supplierId'), material.supplier_id ?? '—'],
    [t('materialDetail.fields.unitPrice'), material.unit_price],
    [t('materialDetail.fields.currentStock'), `${material.quantity} ${material.unit}`],
    [t('materialDetail.fields.minStock'), material.min_stock],
    [t('materialDetail.fields.maxStock'), material.max_stock ?? '—'],
    [t('materialDetail.fields.createdAt'), new Date(material.created_at).toLocaleString()],
  ]

  return (
    <div className="space-y-6">
      <Link to="/materials" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('materialDetail.back')}
      </Link>

      <PageSection title={t('materialDetail.title')} description={material.name} icon={Boxes}>
        <div className="mb-6">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infoItems.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        title={t('materialDetail.recordsTitle')}
        description={t('materialDetail.recordsDescription')}
        icon={Boxes}
      >
        {movements.length === 0 ? (
          <EmptyState icon={Boxes} title={t('materialDetail.empty')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('movements.quantity')}</TableHead>
                <TableHead>{t('movements.unitPrice')}</TableHead>
                <TableHead>{t('materialDetail.fields.referenceNo')}</TableHead>
                <TableHead>{t('materialDetail.fields.remark')}</TableHead>
                <TableHead>{t('common.time')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge variant={movementVariant(movement.movement_type)}>
                      {movement.movement_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.unit_price}</TableCell>
                  <TableCell>{movement.reference_no ?? '—'}</TableCell>
                  <TableCell>{movement.remark ?? '—'}</TableCell>
                  <TableCell>{new Date(movement.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageSection>
    </div>
  )
}
