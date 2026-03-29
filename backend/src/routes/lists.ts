import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router({ mergeParams: true })

router.use(authenticate)

async function getBoardOrFail(boardId: number, userId: number, res: Response): Promise<boolean> {
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: userId } })
  if (!board) {
    res.status(404).json({ message: '보드를 찾을 수 없습니다.' })
    return false
  }
  return true
}

// 리스트 생성
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const { title } = req.body
  if (!title) {
    res.status(400).json({ message: '리스트 제목을 입력해주세요.' })
    return
  }
  try {
    if (!(await getBoardOrFail(boardId, req.userId!, res))) return
    const maxPos = await prisma.list.aggregate({
      where: { boardId },
      _max: { position: true },
    })
    const position = (maxPos._max.position ?? -1) + 1
    const list = await prisma.list.create({
      data: { title, position, boardId },
      include: { cards: true },
    })
    res.status(201).json(list)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 리스트 수정 (제목)
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const id = parseInt(String(req.params.id))
  const { title } = req.body
  if (!title) {
    res.status(400).json({ message: '리스트 제목을 입력해주세요.' })
    return
  }
  try {
    if (!(await getBoardOrFail(boardId, req.userId!, res))) return
    const list = await prisma.list.findFirst({ where: { id, boardId } })
    if (!list) {
      res.status(404).json({ message: '리스트를 찾을 수 없습니다.' })
      return
    }
    const updated = await prisma.list.update({ where: { id }, data: { title } })
    res.json(updated)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 리스트 삭제
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const id = parseInt(String(req.params.id))
  try {
    if (!(await getBoardOrFail(boardId, req.userId!, res))) return
    const list = await prisma.list.findFirst({ where: { id, boardId } })
    if (!list) {
      res.status(404).json({ message: '리스트를 찾을 수 없습니다.' })
      return
    }
    await prisma.list.delete({ where: { id } })
    res.json({ message: '리스트가 삭제되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 리스트 순서 변경
router.patch('/reorder', async (req: AuthRequest, res: Response): Promise<void> => {
  const boardId = parseInt(String(req.params.boardId))
  const { lists } = req.body as { lists: { id: number; position: number }[] }
  if (!Array.isArray(lists)) {
    res.status(400).json({ message: '잘못된 요청입니다.' })
    return
  }
  try {
    if (!(await getBoardOrFail(boardId, req.userId!, res))) return
    await prisma.$transaction(
      lists.map(({ id, position }) =>
        prisma.list.update({ where: { id }, data: { position } })
      )
    )
    res.json({ message: '순서가 변경되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router
