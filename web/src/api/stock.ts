import client from './client'
import type { CreateMovementInput, StockMovement } from '@/types/api'

export interface ListMovementsParams {
  material_id?: number
  movement_type?: 'IN' | 'OUT' | 'ADJUST'
  from?: string
  to?: string
}

export const listMovements = (params?: ListMovementsParams) =>
  client.get<StockMovement[]>('/stock/movements', { params })

export const createMovement = (data: CreateMovementInput) =>
  client.post<StockMovement>('/stock/movements', data)
