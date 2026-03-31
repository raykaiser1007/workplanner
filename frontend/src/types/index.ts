export interface User {
  id: number
  loginId: string
  name: string
}

export interface Board {
  id: number
  title: string
  description?: string
  ownerId: number
  owner: { id: number; name: string }
  createdAt: string
  _count?: { lists: number }
}

export interface List {
  id: number
  title: string
  position: number
  boardId: number
  cards: Card[]
}

export interface Card {
  id: number
  title: string
  description?: string
  position: number
  dueDate?: string
  listId: number
  members: { id: number; name: string }[]
}