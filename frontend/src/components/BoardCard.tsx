import { useState } from 'react'
import { Board } from '../types'

interface Props {
  board: Board
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function BoardCard({ board, onClick, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`"${board.title}" 보드를 삭제할까요?`)) {
      onDelete()
    }
    setMenuOpen(false)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit()
    setMenuOpen(false)
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{board.title}</h3>
          {board.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            리스트 {board._count?.lists ?? 0}개
          </p>
        </div>
        <div className="relative ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            ···
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-28">
                <button onClick={handleEdit} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  수정
                </button>
                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}