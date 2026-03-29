import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { createSupplier, listSuppliers } from '@/api/suppliers'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CreateSupplierInput, Supplier } from '@/types/api'

const initialForm: CreateSupplierInput = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
}

function SuppliersSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-14 rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function SuppliersPage() {
  const { t } = useTranslation()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [nameError, setNameError] = useState<string | null>(null)

  const fetchSuppliers = useCallback(() => {
    setLoading(true)
    setError(null)
    listSuppliers()
      .then((response) => setSuppliers(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      setNameError(t('suppliers.nameRequired'))
      return
    }

    setNameError(null)
    setSubmitting(true)
    try {
      await createSupplier({
        name: form.name.trim(),
        contact_person: form.contact_person?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
      })
      setOpen(false)
      setForm(initialForm)
      fetchSuppliers()
      toast.success(t('suppliers.createSuccess'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <SuppliersSkeleton />
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>
  }

  return (
    <PageSection
      title={t('suppliers.title')}
      description={t('suppliers.description')}
      icon={Truck}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('suppliers.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('suppliers.create')}</DialogTitle>
              <DialogDescription>{t('suppliers.createDescription')}</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="supplier-name">{t('suppliers.name')}</Label>
                <Input
                  id="supplier-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier-contact">{t('suppliers.contactPerson')}</Label>
                  <Input
                    id="supplier-contact"
                    value={form.contact_person}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, contact_person: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-phone">{t('suppliers.phone')}</Label>
                  <Input
                    id="supplier-phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier-email">{t('suppliers.email')}</Label>
                  <Input
                    id="supplier-email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-address">{t('suppliers.address')}</Label>
                  <Input
                    id="supplier-address"
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('common.loading') : t('common.confirm')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {suppliers.length === 0 ? (
        <EmptyState icon={Truck} title={t('suppliers.empty')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.id')}</TableHead>
                  <TableHead>{t('suppliers.name')}</TableHead>
                  <TableHead>{t('suppliers.contactPerson')}</TableHead>
                  <TableHead>{t('suppliers.phone')}</TableHead>
                  <TableHead>{t('suppliers.email')}</TableHead>
                  <TableHead>{t('suppliers.address')}</TableHead>
                  <TableHead>{t('common.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="text-muted-foreground">{supplier.id}</TableCell>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person ?? t('common.none')}</TableCell>
                    <TableCell>{supplier.phone ?? t('common.none')}</TableCell>
                    <TableCell>{supplier.email ?? t('common.none')}</TableCell>
                    <TableCell>{supplier.address ?? t('common.none')}</TableCell>
                    <TableCell>{new Date(supplier.created_at).toLocaleString()}</TableCell>
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
