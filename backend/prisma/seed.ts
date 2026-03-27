import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const connStr = process.env.DATABASE_URL
  if (!connStr) throw new Error('DATABASE_URL is not set')

  const sql = neon(connStr)

  const passwordHash = await bcrypt.hash('password123', 10)

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  await sql`DELETE FROM "Task"`
  await sql`DELETE FROM "User"`

  const [admin] = await sql`
    INSERT INTO "User" (email, password, name, role, "createdAt")
    VALUES (${`admin@todo.com`}, ${passwordHash}, ${'Администратор'}, 'ADMIN', NOW())
    RETURNING id`

  const [ivan] = await sql`
    INSERT INTO "User" (email, password, name, role, "createdAt")
    VALUES (${'ivan@todo.com'}, ${passwordHash}, ${'Иван Иванов'}, 'USER', NOW())
    RETURNING id`

  const [anastasia] = await sql`
    INSERT INTO "User" (email, password, name, role, "createdAt")
    VALUES (${'anastasia@todo.com'}, ${passwordHash}, ${'Анастасия Смирнова'}, 'USER', NOW())
    RETURNING id`

  const [konstantin] = await sql`
    INSERT INTO "User" (email, password, name, role, "createdAt")
    VALUES (${'konstantin@todo.com'}, ${passwordHash}, ${'Константин Петров'}, 'USER', NOW())
    RETURNING id`

  const tasks = [
    { title: 'Купить продукты', description: 'Молоко, хлеб, яйца, фрукты', dueDate: today, isCompleted: false, priority: 'NORMAL', userId: ivan.id },
    { title: 'Сделать отчет', description: 'Подготовить отчет для руководства о результатах за прошедший квартал. Собрать все необходимые данные и проанализировать отчеты всех отделов.', dueDate: today, isCompleted: true, priority: 'IMPORTANT', userId: anastasia.id },
    { title: 'Позвонить клиенту', description: 'Обсудить условия нового договора с клиентом', dueDate: tomorrow, isCompleted: false, priority: 'NORMAL', userId: konstantin.id },
    { title: 'Запланировать встречу', description: 'Организовать встречу команды для обсуждения квартального плана', dueDate: nextWeek, isCompleted: false, priority: 'NORMAL', userId: ivan.id },
    { title: 'Прочитать книгу', description: 'Clean Code — Robert C. Martin', dueDate: nextWeek, isCompleted: false, priority: 'NORMAL', userId: ivan.id },
    { title: 'Обновить документацию', description: 'Актуализировать техническую документацию по API', dueDate: tomorrow, isCompleted: false, priority: 'IMPORTANT', userId: admin.id },
    { title: 'Проверить сервер', description: 'Проверить логи и состояние продакшн сервера', dueDate: yesterday, isCompleted: true, priority: 'IMPORTANT', userId: admin.id },
  ]

  for (const t of tasks) {
    await sql`
      INSERT INTO "Task" (title, description, "dueDate", "isCompleted", priority, "createdAt", "updatedAt", "userId")
      VALUES (${t.title}, ${t.description}, ${t.dueDate}, ${t.isCompleted}, ${t.priority}::"Priority", NOW(), NOW(), ${t.userId})`
  }

  console.log('Seed completed:')
  console.log('  Users: admin@todo.com, ivan@todo.com, anastasia@todo.com, konstantin@todo.com')
  console.log('  Password for all: password123')
  console.log('  Tasks: 7 tasks created')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
