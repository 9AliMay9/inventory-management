import client from './client'
import type {
  CreateUserInput,
  UpdatePasswordInput,
  User,
} from '@/types/api'

export const listUsers = () => client.get<User[]>('/users')
export const createUser = (data: CreateUserInput) => client.post<User>('/users', data)
export const updateUserPassword = (id: number, data: UpdatePasswordInput) =>
  client.patch<User>(`/users/${id}/password`, data)
