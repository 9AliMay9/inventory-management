import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarRange } from 'lucide-react'
import { getMonthlyReport } from '@/api/reports'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { movementVariant } from '@/lib/inventory'
import type { MonthlyReportRow } from '@/types/api'

function MonthlyReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function MonthlyReportPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [rows, setRows] = useState<MonthlyReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getMonthlyReport(Number(year), Number(month))
      setRows(response.data)
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [month, t, year])

  useEffect(() => {
    void loadReport()
  }, [loadReport])

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.quantity += Number.parseFloat(row.total_quantity)
          acc.amount += Number.parseFloat(row.total_amount)
          return acc
        },
        { quantity: 0, amount: 0 }
      ),
    [rows]
  )

  return (
    <PageSection title={t('reports.title')} description={t('reports.description')} icon={CalendarRange}>
      {loading ? (
        <MonthlyReportSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4 md:grid-cols-2">
            <Input
              type="number"
              value={year}
              placeholder={t('reports.year')}
              onChange={(event) => setYear(event.target.value)}
            />
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('reports.month')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, index) => {
                  const value = String(index + 1)
                  return (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {rows.length === 0 ? (
            <EmptyState icon={CalendarRange} title={t('reports.empty')} />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
              <div className="max-h-[28rem] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reports.materialId')}</TableHead>
                      <TableHead>{t('reports.movementType')}</TableHead>
                      <TableHead>{t('reports.totalQuantity')}</TableHead>
                      <TableHead>{t('reports.totalAmount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={`${row.material_id}-${row.movement_type}-${index}`}>
                        <TableCell>{row.material_id}</TableCell>
                        <TableCell>
                          <Badge variant={movementVariant(row.movement_type as 'IN' | 'OUT' | 'ADJUST')}>
                            {row.movement_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.total_quantity}</TableCell>
                        <TableCell>{Number.parseFloat(row.total_amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">{t('reports.summary')}</TableCell>
                      <TableCell>{t('common.all')}</TableCell>
                      <TableCell>{totals.quantity.toFixed(2)}</TableCell>
                      <TableCell>{totals.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </PageSection>
  )
}
