import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const getPrisma = (reqEnv?: any) => {
  // 1. Try to use explicit env (passed from getRequestContext)
  if (reqEnv?.school_db) {
    const adapter = new PrismaD1(reqEnv.school_db)
    return new PrismaClient({ adapter })
  }

  // 2. Try to get context dynamically if available in edge
  try {
    const { getRequestContext } = require('@cloudflare/next-on-pages')
    const { env } = getRequestContext()
    if (env?.school_db) {
      const adapter = new PrismaD1(env.school_db)
      return new PrismaClient({ adapter })
    }
  } catch (e) {
    // Not running on Cloudflare Edge or getRequestContext is not available
  }

  // 3. Fallback to local SQLite (Node.js runtime / local dev)
  const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  return prisma
}

// Convenience export for components that still statically import it.
// In edge runtime, this might fallback to Node.js proxy if not careful,
// so it's better to use getPrisma() inside function bodies.
export const prisma = getPrisma()
