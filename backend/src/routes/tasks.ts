import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Priority, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { authenticate, authorizeTaskAccess } from '../middleware/auth'

const router = Router()

router.use(authenticate)

const taskInclude = {
  user: {
    select: { id: true, name: true, email: true },
  },
}

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'completed']).optional().default('all'),
  priority: z.enum(['NORMAL', 'IMPORTANT']).optional(),
  sortBy: z.enum(['date', 'title', 'priority']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
})

const createTaskSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  priority: z.nativeEnum(Priority).optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Название обязательно').optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  isCompleted: z.boolean().optional(),
  priority: z.nativeEnum(Priority).optional(),
})

// GET /api/tasks
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = querySchema.safeParse(req.query)

    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message })
      return
    }

    const { search, status, priority, sortBy, sortOrder, page, limit } = result.data

    const where: Prisma.TaskWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') where.isCompleted = false
    if (status === 'completed') where.isCompleted = true

    if (priority) where.priority = priority

    let orderBy: Prisma.TaskOrderByWithRelationInput = {}

    if (sortBy === 'date') orderBy = { dueDate: sortOrder }
    if (sortBy === 'title') orderBy = { title: sortOrder }
    if (sortBy === 'priority') {
      // IMPORTANT > NORMAL по смыслу, но алфавитно IMPORTANT < NORMAL
      // поэтому инвертируем порядок для enum
      orderBy = { priority: sortOrder === 'asc' ? 'desc' : 'asc' }
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({ where, orderBy, skip, take: limit, include: taskInclude }),
      prisma.task.count({ where }),
    ])

    res.json({
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/tasks
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = createTaskSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message })
      return
    }

    const { title, description, dueDate, priority } = result.data

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority ?? Priority.NORMAL,
        userId: req.user!.id,
      },
      include: taskInclude,
    })

    res.status(201).json(task)
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// PUT /api/tasks/:id
router.put('/:id', authorizeTaskAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = updateTaskSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({ message: result.error.errors[0].message })
      return
    }

    const { title, description, dueDate, isCompleted, priority } = result.data

    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(priority !== undefined && { priority }),
      },
      include: taskInclude,
    })

    res.json(task)
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', authorizeTaskAccess, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.task.delete({ where: { id: parseInt(req.params.id as string) } })
    res.json({ message: 'Задача удалена' })
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

export default router
