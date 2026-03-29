import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import ProtectedRoute from '@/components/app/ProtectedRoute'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import AlertsPage from '@/pages/AlertsPage'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import MaterialDetailPage from '@/pages/MaterialDetailPage'
import MaterialsPage from '@/pages/MaterialsPage'
import MonthlyReportPage from '@/pages/MonthlyReportPage'
import MovementsPage from '@/pages/MovementsPage'
import StocktakingPage from '@/pages/StocktakingPage'
import StocktakingDetailPage from '@/pages/StocktakingDetailPage'
import SuppliersPage from '@/pages/SuppliersPage'
import UsersPage from '@/pages/UsersPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'materials', element: <MaterialsPage /> },
      { path: 'materials/:id', element: <MaterialDetailPage /> },
      { path: 'stock/movements', element: <MovementsPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'stocktaking', element: <StocktakingPage /> },
      { path: 'stocktaking/:id', element: <StocktakingDetailPage /> },
      { path: 'reports/monthly', element: <MonthlyReportPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
