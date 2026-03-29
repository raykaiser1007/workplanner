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