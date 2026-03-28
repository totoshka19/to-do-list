import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // Vercel serverless: WebSocket-адаптер нужен, т.к. TCP-соединения не поддерживаются
    // Prisma 7: PrismaNeon принимает { connectionString }, без Pool
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const { neonConfig } = require('@neondatabase/serverless')
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
    return new PrismaClient({ adapter })
  }
  // Локально: стандартное TCP-подключение, адаптер не нужен
  return new PrismaClient()
}

export const prisma = createPrismaClient()
