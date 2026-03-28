import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const router = Router()

// 회원가입
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { loginId, password, name } = req.body

  if (!loginId || !password || !name) {
    res.status(400).json({ message: '아이디, 비밀번호, 이름을 입력해주세요.' })
    return
  }

  try {
    const existing = await prisma.user.findUnique({ where: { loginId } })
    if (existing) {
      res.status(409).json({ message: '이미 사용 중인 아이디입니다.' })
      return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { loginId, password: hashed, name },
      select: { id: true, loginId: true, name: true, createdAt: true },
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
    res.status(201).json({ token, user })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// 로그인
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { loginId, password } = req.body

  if (!loginId || !password) {
    res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { loginId } })
    if (!user) {
      res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
      return
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user.id, loginId: user.loginId, name: user.name },
    })
  } catch {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

export default router