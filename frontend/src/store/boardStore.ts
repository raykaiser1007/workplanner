import { create } from 'zustand'
import { api } from '../lib/api'
import { Board } from '../types'

interface BoardState {
  boards: Board[]
  loading: boolean
  fetchBoards: () => Promise<void>
  createBoard: (title: string, description?: string) => Promise<void>
  updateBoard: (id: number, title: string, description?: string) => Promise<void>
  deleteBoard: (id: number) => Promise<void>
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  loading: false,

  fetchBoards: async () => {
    set({ loading: true })
    try {
      const boards = await api.get<Board[]>('/boards')
      set({ boards })
    } finally {
      set({ loading: false })
    }
  },

  createBoard: async (title, description) => {
    const board = await api.post<Board>('/boards', { title, description })
    set((s) => ({ boards: [board, ...s.boards] }))
  },

  updateBoard: async (id, title, description) => {
    const updated = await api.put<Board>(`/boards/${id}`, { title, description })
    set((s) => ({ boards: s.boards.map((b) => (b.id === id ? updated : b)) }))
  },

  deleteBoard: async (id) => {
    await api.delete(`/boards/${id}`)
    set((s) => ({ boards: s.boards.filter((b) => b.id !== id) }))
  },
}))