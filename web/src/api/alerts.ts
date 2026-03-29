import client from './client'
import type { Alert } from '@/types/api'

export const listAlerts = () => client.get<Alert[]>('/alerts')
export const resolveAlert = (id: number) => client.post<Alert>(`/alerts/${id}/resolve`)
