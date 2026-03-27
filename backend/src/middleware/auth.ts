import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { Role } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: Role
      }
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Токен не предоставлен' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number
      email: string
      role: Role
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Недействительный токен' })
  }
}

export const authorizeTaskAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const taskId = parseInt(req.params.id as string)

  if (isNaN(taskId)) {
    res.status(400).json({ message: 'Некорректный ID задачи' })
    return
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })

    if (!task) {
      res.status(404).json({ message: 'Задача не найдена' })
      return
    }

    if (task.userId !== req.user!.id && req.user!.role !== Role.ADMIN) {
      res.status(403).json({ message: 'Нет доступа к этой задаче' })
      return
    }

    next()
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}
