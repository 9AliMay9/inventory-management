import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
}

export default function PageSection({
  title,
  description,
  icon: Icon,
  action,
  children,
}: PageSectionProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
