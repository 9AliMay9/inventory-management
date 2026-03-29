import client from './client'
import type {
  AddStocktakingItemInput,
  CreateStocktakingInput,
  Stocktaking,
  StocktakingItem,
} from '@/types/api'

export const listStocktaking = () => client.get<Stocktaking[]>('/stocktaking')
export const getStocktaking = (id: number) => client.get<Stocktaking>(`/stocktaking/${id}`)
export const createStocktaking = (data: CreateStocktakingInput) =>
  client.post<Stocktaking>('/stocktaking', data)
export const addStocktakingItem = (id: number, data: AddStocktakingItemInput) =>
  client.post<StocktakingItem>(`/stocktaking/${id}/items`, data)
export const confirmStocktaking = (id: number) =>
  client.post<Stocktaking>(`/stocktaking/${id}/confirm`)
export const getStocktakingItems = (id: number) =>
  client.get<StocktakingItem[]>(`/stocktaking/${id}/items`)
