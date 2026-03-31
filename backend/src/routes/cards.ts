import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router({ mergeParams: true })

router.use(authenticate)

async function getListOrFail(
  listId: number,
  boardId: number,
  userId: number,
  res: Response
): Promise<boolean> {
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: userId } })
  if (!board) {
    res.status(404).json({ message: '보드를 찾을 수 없습니다.' })
    return false
  }
  const list = await prisma.list.findFirst({ where: { id: listId, boardId } })
  if (!list) {
    res.status(404).json({ message: '리스트를 찾을 수 없습니다.' })
    return false
  }
  return true
}

// 카드 생성
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const { title } = req.body
  if (!title) {
    res.status(400).json({ message: '카드 제목을 입력해주세요.' })
    return
  }
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    const maxPos = await prisma.card.aggregate({
      where: { listId },
      _max: { position: true },
    })
    const position = (maxPos._max.position ?? -1) + 1
    const card = await prisma.card.create({
      data: { title, position, listId },
    })
    res.status(201).json(card)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 카드 수정 (제목, 설명)
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const id = parseInt(String(req.params.id))
  const { title, description } = req.body
  if (!title) {
    res.status(400).json({ message: '카드 제목을 입력해주세요.' })
    return
  }
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    const card = await prisma.card.findFirst({ where: { id, listId } })
    if (!card) {
      res.status(404).json({ message: '카드를 찾을 수 없습니다.' })
      return
    }
    const updated = await prisma.card.update({
      where: { id },
      data: { title, description: description ?? card.description },
    })
    res.json(updated)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 담당자 추가
router.post('/:id/members', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const cardId = parseInt(String(req.params.id))
  const { userId } = req.body as { userId: number }
  if (!userId) {
    res.status(400).json({ message: '사용자 ID를 입력해주세요.' })
    return
  }
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    await prisma.cardMember.upsert({
      where: { cardId_userId: { cardId, userId } },
      create: { cardId, userId },
      update: {},
    })
    res.json({ message: '담당자가 추가되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 담당자 제거
router.delete('/:id/members/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const cardId = parseInt(String(req.params.id))
  const userId = parseInt(String(req.params.userId))
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    await prisma.cardMember.deleteMany({ where: { cardId, userId } })
    res.json({ message: '담당자가 제거되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 카드 순서 변경 (같은 리스트)
router.patch('/reorder', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const { cards } = req.body as { cards: { id: number; position: number }[] }
  if (!Array.isArray(cards)) {
    res.status(400).json({ message: '잘못된 요청입니다.' })
    return
  }
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    await prisma.$transaction(
      cards.map(({ id, position }) =>
        prisma.card.update({ where: { id }, data: { position } })
      )
    )
    res.json({ message: '순서가 변경되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 카드 다른 리스트로 이동
router.patch('/:id/move', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const fromListId = parseInt(String(req.params.listId))
  const cardId = parseInt(String(req.params.id))
  const { toListId, position } = req.body as { toListId: number; position: number }
  if (!toListId || position === undefined) {
    res.status(400).json({ message: '잘못된 요청입니다.' })
    return
  }
  try {
    if (!(await getListOrFail(fromListId, boardId, req.userId!, res))) return
    const toList = await prisma.list.findFirst({ where: { id: toListId, boardId } })
    if (!toList) {
      res.status(404).json({ message: '대상 리스트를 찾을 수 없습니다.' })
      return
    }
    const card = await prisma.card.findFirst({ where: { id: cardId, listId: fromListId } })
    if (!card) {
      res.status(404).json({ message: '카드를 찾을 수 없습니다.' })
      return
    }
    const sourceCards = await prisma.card.findMany({
      where: { listId: fromListId, id: { not: cardId } },
      orderBy: { position: 'asc' },
    })
    const destCards = await prisma.card.findMany({
      where: { listId: toListId },
      orderBy: { position: 'asc' },
    })
    await prisma.$transaction([
      prisma.card.update({ where: { id: cardId }, data: { listId: toListId, position } }),
      ...sourceCards.map((c, idx) =>
        prisma.card.update({ where: { id: c.id }, data: { position: idx } })
      ),
      ...destCards
        .filter((c) => c.position >= position)
        .map((c) =>
          prisma.card.update({ where: { id: c.id }, data: { position: c.position + 1 } })
        ),
    ])
    res.json({ message: '카드가 이동되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 카드 삭제
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const listId = parseInt(String(req.params.listId))
  const id = parseInt(String(req.params.id))
  try {
    if (!(await getListOrFail(listId, boardId, req.userId!, res))) return
    const card = await prisma.card.findFirst({ where: { id, listId } })
    if (!card) {
      res.status(404).json({ message: '카드를 찾을 수 없습니다.' })
      return
    }
    await prisma.card.delete({ where: { id } })
    res.json({ message: '카드가 삭제되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router