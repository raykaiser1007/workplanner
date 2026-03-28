import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// 전체 사용자 목록 (카드 담당자 지정용)
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, loginId: true, name: true },
      orderBy: { name: 'asc' },
    })
    res.json(users)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 내 정보 조회
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, loginId: true, name: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      return
    }
    res.json(user)
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router
