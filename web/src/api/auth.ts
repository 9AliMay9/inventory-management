import client from './client'

export interface LoginResponse {
  token: string
}

export const login = (username: string, password: string) =>
  client.post<LoginResponse>('/auth/login', { username, password })
