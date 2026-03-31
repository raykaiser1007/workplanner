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
  reorderCards: (boardId: number, listId: number, newCards: Card[]) => Promise<void>
  moveCard: (boardId: number, cardId: number, fromListId: number, toListId: number, toPosition: number) => Promise<void>
  addMember: (boardId: number, listId: number, cardId: number, user: { id: number; name: string }) => Promise<void>
  removeMember: (boardId: number, listId: number, cardId: number, userId: number) => Promise<void>
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

  reorderCards: async (boardId, listId, newCards) => {
    set({
      lists: get().lists.map((l) =>
        l.id === listId ? { ...l, cards: newCards } : l
      ),
    })
    await api.patch(`/boards/${boardId}/lists/${listId}/cards/reorder`, {
      cards: newCards.map((c) => ({ id: c.id, position: c.position })),
    })
  },

  addMember: async (boardId, listId, cardId, user) => {
    set({
      lists: get().lists.map((l) =>
        l.id === listId
          ? { ...l, cards: l.cards.map((c) =>
              c.id === cardId && !c.members.find((m) => m.id === user.id)
                ? { ...c, members: [...c.members, user] }
                : c
            )}
          : l
      ),
    })
    await api.post(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members`, { userId: user.id })
  },

  removeMember: async (boardId, listId, cardId, userId) => {
    set({
      lists: get().lists.map((l) =>
        l.id === listId
          ? { ...l, cards: l.cards.map((c) =>
              c.id === cardId
                ? { ...c, members: c.members.filter((m) => m.id !== userId) }
                : c
            )}
          : l
      ),
    })
    await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members/${userId}`)
  },

  moveCard: async (boardId, cardId, fromListId, toListId, toPosition) => {
    const lists = get().lists
    const fromList = lists.find((l) => l.id === fromListId)!
    const card = fromList.cards.find((c) => c.id === cardId)!
    set({
      lists: lists.map((l) => {
        if (l.id === fromListId) {
          return {
            ...l,
            cards: l.cards
              .filter((c) => c.id !== cardId)
              .map((c, idx) => ({ ...c, position: idx })),
          }
        }
        if (l.id === toListId) {
          const destCards = [...l.cards]
          destCards.splice(toPosition, 0, { ...card, listId: toListId, position: toPosition })
          return { ...l, cards: destCards.map((c, idx) => ({ ...c, position: idx })) }
        }
        return l
      }),
    })
    await api.patch(`/boards/${boardId}/lists/${fromListId}/cards/${cardId}/move`, {
      toListId,
      position: toPosition,
    })
  },
}))