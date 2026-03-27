import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any)

export const prisma = new PrismaClient({ adapter })
