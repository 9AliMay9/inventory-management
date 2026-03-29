import client from './client'
import type { MonthlyReportRow } from '@/types/api'

export const getMonthlyReport = (year: number, month: number) =>
  client.get<MonthlyReportRow[]>('/reports/monthly', {
    params: { year, month },
  })
