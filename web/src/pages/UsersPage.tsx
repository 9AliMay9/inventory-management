import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { Plus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { createUser, listUsers, updateUserPassword } from '@/api/users'
import EmptyState from '@/components/app/EmptyState'
import PageSection from '@/components/app/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuthStore } from '@/store/authStore'
import type { CreateUserInput, UpdatePasswordInput, User } from '@/types/api'

const initialCreateForm: CreateUserInput = {
  username: '',
  password: '',
}

const initialPasswordForm: UpdatePasswordInput = {
  new_password: '',
}

function UsersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}

export default function UsersPage() {
  const { t } = useTranslation()
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = currentUser?.role === 'admin'
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    setError(null)
    listUsers()
      .then((response) => setUsers(response.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createUser({
        username: createForm.username,
        password: createForm.password,
      })
      setCreateOpen(false)
      setCreateForm(initialCreateForm)
      fetchUsers()
      toast.success(t('users.createSuccess'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      if (error.response?.status === 409) {
        toast.error(t('users.usernameTaken'))
      } else {
        toast.error(error.response?.data?.error ?? t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      await updateUserPassword(selectedUser.id, passwordForm)
      setPasswordOpen(false)
      setPasswordForm(initialPasswordForm)
      toast.success(t('users.passwordChanged'))
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      toast.error(error.response?.data?.error ?? t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageSection
      title={t('users.title')}
      description={t('users.description')}
      icon={Shield}
      action={
        isAdmin ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('users.create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('users.create')}</DialogTitle>
                <DialogDescription>{t('users.createDescription')}</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="user-username">{t('users.username')}</Label>
                  <Input
                    id="user-username"
                    value={createForm.username}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, username: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">{t('users.password')}</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, password: event.target.value }))
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
      {loading ? (
        <UsersSkeleton />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={Shield} title={t('users.empty')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="max-h-[28rem] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.id')}</TableHead>
                    <TableHead>{t('users.username')}</TableHead>
                    <TableHead>{t('users.role')}</TableHead>
                    <TableHead>{t('users.isActive')}</TableHead>
                    <TableHead>{t('common.createdAt')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isSelf = currentUser?.id === user.id
                    const canChangePassword = isAdmin || isSelf
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                            {t(`users.roles.${user.role}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.is_active ? t('users.active') : t('users.inactive')}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {canChangePassword ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setPasswordForm(initialPasswordForm)
                                setPasswordOpen(true)
                              }}
                            >
                              {t('users.changePassword')}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('users.changePassword')}</DialogTitle>
                <DialogDescription>{selectedUser?.username}</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('users.newPassword')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(event) => setPasswordForm({ new_password: event.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.confirm')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </PageSection>
  )
}
