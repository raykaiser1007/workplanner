import { create } from 'zustand'
import { api } from '../lib/api'
import type { List, Card } from '../types'

interface ListStore {
  lists: List[]
  loading: boolean
  setLists: (lists: List[]) => void
  createList: (boardId: number, title: string) => Promise<void>
  updateList: (boardId: number, listId: number, title: string) => Promise<void>
  deleteList: (boardId: number, listId: number) => Promise<void>
  reorderLists: (boardId: number, lists: { id: number; position: number }[]) => Promise<void>
  createCard: (boardId: number, listId: number, title: string) => Promise<void>
  updateCard: (boardId: number, listId: number, cardId: number, data: { title: string; description?: string }) => Promise<void>
  deleteCard: (boardId: number, listId: number, cardId: number) => Promise<void>
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: [],
  loading: false,

  setLists: (lists) => set({ lists }),

  createList: async (boardId, title) => {
    const list = await api.post<List>(`/boards/${boardId}/lists`, { title })
    set({ lists: [...get().lists, list] })
  },

  updateList: async (boardId, listId, title) => {
    const updated = await api.put<List>(`/boards/${boardId}/lists/${listId}`, { title })
    set({ lists: get().lists.map((l) => (l.id === listId ? { ...l, title: updated.title } : l)) })
  },

  deleteList: async (boardId, listId) => {
    await api.delete(`/boards/${boardId}/lists/${listId}`)
    set({ lists: get().lists.filter((l) => l.id !== listId) })
  },

  reorderLists: async (boardId, lists) => {
    await api.patch(`/boards/${boardId}/lists/reorder`, { lists })
  },

  createCard: async (boardId, listId, title) => {
    const card = await api.post<Card>(`/boards/${boardId}/lists/${listId}/cards`, { title })
    set({
      lists: get().lists.map((l) =>
        l.id === listId ? { ...l, cards: [...l.cards, card] } : l
      ),
    })
  },

  updateCard: async (boardId, listId, cardId, data) => {
    const updated = await api.put<Card>(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, data)
    set({
      lists: get().lists.map((l) =>
        l.id === listId
          ? { ...l, cards: l.cards.map((c) => (c.id === cardId ? updated : c)) }
          : l
      ),
    })
  },

  deleteCard: async (boardId, listId, cardId) => {
    await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`)
    set({
      lists: get().lists.map((l) =>
        l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
      ),
    })
  },
}))