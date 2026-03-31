import { useState, useRef, useEffect } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { useListStore } from '../store/listStore'
import { api } from '../lib/api'
import type { List, Card } from '../types'

const AVATAR_COLORS = ['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-red-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400']

function Avatar({ user, size = 'sm' }: { user: { id: number; name: string }; size?: 'sm' | 'xs' }) {
  const color = AVATAR_COLORS[user.id % AVATAR_COLORS.length]
  const cls = size === 'xs' ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-xs'
  return (
    <span className={`inline-flex items-center justify-center rounded-full text-white font-bold ${color} ${cls}`}>
      {user.name.charAt(0)}
    </span>
  )
}

interface Props {
  list: List
  boardId: number
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined
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
  const { updateCard, deleteCard, addMember, removeMember } = useListStore()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [assigning, setAssigning] = useState(false)
  const [allUsers, setAllUsers] = useState<{ id: number; name: string }[]>([])
  const assignRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!assigning) return
    function onClickOutside(e: MouseEvent) {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) {
        setAssigning(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [assigning])

  async function openAssign() {
    if (allUsers.length === 0) {
      const users = await api.get<{ id: number; name: string }[]>('/users')
      setAllUsers(users)
    }
    setAssigning((v) => !v)
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== card.title) {
      updateCard(boardId, listId, card.id, { title: trimmed })
    } else {
      setTitle(card.title)
    }
    setEditing(false)
  }

  function toggleMember(user: { id: number; name: string }) {
    const assigned = card.members.find((m) => m.id === user.id)
    if (assigned) {
      removeMember(boardId, listId, card.id, user.id)
    } else {
      addMember(boardId, listId, card.id, user)
    }
  }

  return (
    <div className="bg-white rounded shadow-sm px-3 py-2 mb-2 text-sm text-gray-700 group">
      <div className="flex items-start gap-1">
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
          <span className="flex-1 cursor-pointer leading-snug" onClick={() => setEditing(true)}>
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

      {/* 담당자 영역 */}
      <div className="relative mt-1.5 flex items-center gap-1 flex-wrap" ref={assignRef}>
        {card.members.map((m) => (
          <button
            key={m.id}
            onClick={() => removeMember(boardId, listId, card.id, m.id)}
            title={`${m.name} 제거`}
          >
            <Avatar user={m} size="xs" />
          </button>
        ))}
        <button
          onClick={openAssign}
          className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-[10px] flex items-center justify-center transition-colors"
          title="담당자 지정"
        >
          +
        </button>

        {assigning && (
          <div className="absolute top-6 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            <p className="text-[10px] text-gray-400 px-3 pb-1 font-medium">담당자 지정</p>
            {allUsers.length === 0 && (
              <p className="text-xs text-gray-400 px-3 py-1">불러오는 중...</p>
            )}
            {allUsers.map((user) => {
              const assigned = !!card.members.find((m) => m.id === user.id)
              return (
                <button
                  key={user.id}
                  onClick={() => toggleMember(user)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left"
                >
                  <Avatar user={user} size="xs" />
                  <span className="text-xs text-gray-700 flex-1">{user.name}</span>
                  {assigned && <span className="text-blue-500 text-xs">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ListColumn({ list, boardId, dragHandleProps, onUpdate, onDelete }: Props) {
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
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        {...(!editing ? dragHandleProps : {})}
      >
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
      <Droppable droppableId={`${list.id}`} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="px-2 flex-1 overflow-y-auto min-h-[8px]"
          >
            {list.cards.map((card, index) => (
              <Draggable key={card.id} draggableId={`card-${card.id}`} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <CardItem card={card} boardId={boardId} listId={list.id} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

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