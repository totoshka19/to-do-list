import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // Vercel serverless: WebSocket-адаптер нужен, т.к. TCP-соединения не поддерживаются
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const { Pool } = require('@neondatabase/serverless')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    return new PrismaClient({ adapter: new PrismaNeon(pool) })
  }
  // Локально: стандартное TCP-подключение, адаптер не нужен
  return new PrismaClient()
}

export const prisma = createPrismaClient()
