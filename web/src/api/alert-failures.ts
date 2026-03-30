import client from './client'
import type { AlertFailure } from '@/types/api'

export const listAlertFailures = () => client.get<AlertFailure[]>('/alert-failures')
