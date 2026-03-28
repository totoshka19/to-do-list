import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const loginSchema = z.object({
  email: z.string().min(1, 'Email обязателен').email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message })
      return
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      res.status(401).json({ message: 'Неверный email или пароль' })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Неверный email или пароль' })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
