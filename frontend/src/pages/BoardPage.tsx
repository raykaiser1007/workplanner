import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useListStore } from '../store/listStore'
import { api } from '../lib/api'
import ListColumn from '../components/ListColumn'
import type { Board } from '../types'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { lists, setLists, createList, updateList, deleteList } = useListStore()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingList, setAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')

  const boardId = parseInt(id!)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Board & { lists: typeof lists }>(`/boards/${boardId}`)
        setBoard(data)
        setLists(data.lists ?? [])
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [boardId, navigate, setLists])

  async function handleAddList() {
    const title = newListTitle.trim()
    if (!title) return
    await createList(boardId, title)
    setNewListTitle('')
    setAddingList(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0079bf' }}>
      <header className="bg-black/20 text-white px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm hover:text-blue-200 transition-colors"
        >
          ← 대시보드
        </button>
        <h1 className="text-base font-bold flex-1">{board?.title}</h1>
        <span className="text-sm opacity-80">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm bg-black/20 hover:bg-black/30 px-3 py-1 rounded transition-colors"
        >
          로그아웃
        </button>
      </header>

      <main className="flex-1 p-4 flex items-start gap-3 overflow-x-auto">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            boardId={boardId}
            onUpdate={(listId, title) => updateList(boardId, listId, title)}
            onDelete={(listId) => deleteList(boardId, listId)}
          />
        ))}

        {addingList ? (
          <div className="bg-gray-100 rounded-lg w-64 flex-shrink-0 p-2">
            <input
              autoFocus
              className="w-full text-sm border border-blue-400 rounded px-2 py-1.5 outline-none mb-2"
              placeholder="리스트 제목 입력..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddList()
                if (e.key === 'Escape') { setAddingList(false); setNewListTitle('') }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddList}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => { setAddingList(false); setNewListTitle('') }}
                className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingList(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg w-64 flex-shrink-0 px-3 py-2 text-left transition-colors"
          >
            + 리스트 추가
          </button>
        )}
      </main>
    </div>
  )
}