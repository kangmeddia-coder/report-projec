import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

import { getCloudflareContext } from '@opennextjs/cloudflare'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma as PrismaClient
  }

  // 1. Cloudflare Workers runtime
  try {
    const ctx = getCloudflareContext()
    if (ctx?.env?.school_db) {
      const adapter = new PrismaD1(ctx.env.school_db)
      globalForPrisma.prisma = new PrismaClient({ adapter: adapter as any })
      return globalForPrisma.prisma
    }
  } catch (e) {
    // Throws outside of request context
  }

  // 2. Local / Node.js development
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = new PrismaClient()
    return globalForPrisma.prisma
  }

  // 3. Fallback - return a no-op proxy during build time static analysis
  // This prevents PrismaClientValidationError during `next build`
  const proxy = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') return async () => {}
      if (prop === '$transaction') return async (fn: any) => fn(proxy)
      // Return a model proxy for any Prisma model access
      return new Proxy({}, {
        get(_t, method) {
          return async () => {
            if (method === 'findMany' || method === 'findFirst' || method === 'findUnique') return null
            if (method === 'count') return 0
            return {}
          }
        }
      })
    }
  })

  return proxy
}
