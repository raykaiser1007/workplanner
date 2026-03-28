import { create } from 'zustand'
import { api } from '../lib/api'

interface User {
  id: number
  loginId: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (loginId: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (loginId, password) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { loginId, password })
    localStorage.setItem('token', res.token)
    set({ user: res.user, token: res.token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
}))
