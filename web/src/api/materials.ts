import client from './client'
import type { CreateMaterialInput, Material } from '@/types/api'

export interface ListMaterialsParams {
  name?: string
  category?: string
  supplier_id?: number
}

export const listMaterials = (params?: ListMaterialsParams) =>
  client.get<Material[]>('/materials', { params })

export const getMaterial = (id: number) => client.get<Material>(`/materials/${id}`)
export const createMaterial = (data: CreateMaterialInput) =>
  client.post<Material>('/materials', data)
