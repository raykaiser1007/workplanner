import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticate)

// 보드 목록 조회
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { lists: true } },
      },
    })
    res.json(boards)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 보드 단건 조회
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  try {
    const board = await prisma.board.findFirst({
      where: { id, ownerId: req.userId },
      include: {
        owner: { select: { id: true, name: true } },
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    })
    if (!board) {
      res.status(404).json({ message: '보드를 찾을 수 없습니다.' })
      return
    }
    res.json(board)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 보드 생성
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description } = req.body
  if (!title) {
    res.status(400).json({ message: '보드 제목을 입력해주세요.' })
    return
  }
  try {
    const board = await prisma.board.create({
      data: { title, description, ownerId: req.userId! },
      include: { owner: { select: { id: true, name: true } } },
    })
    res.status(201).json(board)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 보드 수정
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  const { title, description } = req.body
  if (!title) {
    res.status(400).json({ message: '보드 제목을 입력해주세요.' })
    return
  }
  try {
    const board = await prisma.board.findFirst({ where: { id, ownerId: req.userId } })
    if (!board) {
      res.status(404).json({ message: '보드를 찾을 수 없습니다.' })
      return
    }
    const updated = await prisma.board.update({
      where: { id },
      data: { title, description },
    })
    res.json(updated)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 보드 삭제
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id))
  try {
    const board = await prisma.board.findFirst({ where: { id, ownerId: req.userId } })
    if (!board) {
      res.status(404).json({ message: '보드를 찾을 수 없습니다.' })
      return
    }
    await prisma.board.delete({ where: { id } })
    res.json({ message: '보드가 삭제되었습니다.' })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router
