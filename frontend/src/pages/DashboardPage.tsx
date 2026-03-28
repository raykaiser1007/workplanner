import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useBoardStore } from '../store/boardStore'
import BoardCard from '../components/BoardCard'
import BoardModal from '../components/BoardModal'
import type { Board } from '../types'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { boards, loading, fetchBoards, createBoard, updateBoard, deleteBoard } = useBoardStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Board | null>(null)

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Workplanner</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">내 보드</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            + 새 보드
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">아직 보드가 없습니다. 새 보드를 만들어 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => {}}
                onEdit={() => setEditTarget(board)}
                onDelete={() => deleteBoard(board.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <BoardModal
          onClose={() => setShowCreate(false)}
          onSubmit={(title, desc) => createBoard(title, desc)}
        />
      )}
      {editTarget && (
        <BoardModal
          board={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(title, desc) => updateBoard(editTarget.id, title, desc)}
        />
      )}
    </div>
  )
}