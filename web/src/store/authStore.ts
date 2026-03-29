import { create } from 'zustand'

export interface AuthUser {
  id: number
  username: string
  role: 'admin' | 'staff'
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })(),
  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
