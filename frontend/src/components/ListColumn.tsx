import { useState } from 'react'
import { useListStore } from '../store/listStore'
import type { List, Card } from '../types'

interface Props {
  list: List
  boardId: number
  onUpdate: (listId: number, title: string) => void
  onDelete: (listId: number) => void
}

function CardItem({
  card,
  boardId,
  listId,
}: {
  card: Card
  boardId: number
  listId: number
}) {
  const { updateCard, deleteCard } = useListStore()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)

  function handleSubmit() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== card.title) {
      updateCard(boardId, listId, card.id, { title: trimmed })
    } else {
      setTitle(card.title)
    }
    setEditing(false)
  }

  return (
    <div className="bg-white rounded shadow-sm px-3 py-2 mb-2 text-sm text-gray-700 group flex items-start gap-1">
      {editing ? (
        <input
          autoFocus
          className="flex-1 text-sm border border-blue-400 rounded px-1.5 py-0.5 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') { setTitle(card.title); setEditing(false) }
          }}
        />
      ) : (
        <span className="flex-1 cursor-pointer" onClick={() => setEditing(true)}>
          {card.title}
        </span>
      )}
      <button
        onClick={() => {
          if (confirm(`"${card.title}" 카드를 삭제할까요?`)) {
            deleteCard(boardId, listId, card.id)
          }
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-all flex-shrink-0 mt-0.5"
        title="카드 삭제"
      >
        ✕
      </button>
    </div>
  )
}

export default function ListColumn({ list, boardId, onUpdate, onDelete }: Props) {
  const { createCard } = useListStore()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  function handleTitleSubmit() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== list.title) {
      onUpdate(list.id, trimmed)
    } else {
      setTitle(list.title)
    }
    setEditing(false)
  }

  async function handleAddCard() {
    const trimmed = newCardTitle.trim()
    if (!trimmed) return
    await createCard(boardId, list.id, trimmed)
    setNewCardTitle('')
    setAddingCard(false)
  }

  return (
    <div className="bg-gray-200 rounded-lg w-64 flex-shrink-0 flex flex-col max-h-[calc(100vh-80px)]">
      {/* 리스트 헤더 */}
      <div className="flex items-center justify-between px-3 py-2">
        {editing ? (
          <input
            autoFocus
            className="flex-1 text-sm font-semibold bg-white border border-blue-400 rounded px-2 py-0.5 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit()
              if (e.key === 'Escape') { setTitle(list.title); setEditing(false) }
            }}
          />
        ) : (
          <h3
            className="flex-1 text-sm font-semibold text-gray-800 cursor-pointer truncate"
            onClick={() => setEditing(true)}
          >
            {list.title}
          </h3>
        )}
        <button
          onClick={() => {
            if (confirm(`"${list.title}" 리스트를 삭제할까요?`)) onDelete(list.id)
          }}
          className="ml-2 text-gray-400 hover:text-red-500 text-xs transition-colors"
          title="리스트 삭제"
        >
          ✕
        </button>
      </div>

      {/* 카드 목록 */}
      <div className="px-2 flex-1 overflow-y-auto">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} boardId={boardId} listId={list.id} />
        ))}
      </div>

      {/* 카드 추가 영역 */}
      <div className="px-2 pb-2 pt-1">
        {addingCard ? (
          <div>
            <textarea
              autoFocus
              rows={2}
              className="w-full text-sm border border-blue-400 rounded px-2 py-1.5 outline-none resize-none mb-2"
              placeholder="카드 제목 입력... (Ctrl+Enter로 추가)"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleAddCard() }
                if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCard}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => { setAddingCard(false); setNewCardTitle('') }}
                className="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full text-left text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-300 rounded px-2 py-1.5 transition-colors"
          >
            + 카드 추가
          </button>
        )}
      </div>
    </div>
  )
}