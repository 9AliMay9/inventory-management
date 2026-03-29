import { Outlet } from 'react-router'
import AppHeader from '@/components/app/AppHeader'
import AppSidebar from '@/components/app/AppSidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_26%)]">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
