import client from './client'
import type { CreateSupplierInput, Supplier } from '@/types/api'

export const listSuppliers = () => client.get<Supplier[]>('/suppliers')
export const getSupplier = (id: number) => client.get<Supplier>(`/suppliers/${id}`)
export const createSupplier = (data: CreateSupplierInput) =>
  client.post<Supplier>('/suppliers', data)
