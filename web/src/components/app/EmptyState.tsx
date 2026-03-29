import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
}

export default function EmptyState({ icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{title}</p>
    </div>
  )
}
