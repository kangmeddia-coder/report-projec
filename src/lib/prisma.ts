import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getRequestContext } from '@cloudflare/next-on-pages'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // 1. Try to get context dynamically if available in edge
  let env: any = null
  try {
    const ctx = getRequestContext()
    env = ctx.env
  } catch (e) {
    // getRequestContext throws if not in cloudflare environment
  }

  if (env && env.school_db) {
    const adapter = new PrismaD1(env.school_db)
    globalForPrisma.prisma = new PrismaClient({ adapter: adapter as any })
    return globalForPrisma.prisma
  }

  // 2. Fallback for local development or Node.js environment
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === 'nodejs') {
    globalForPrisma.prisma = new PrismaClient()
    return globalForPrisma.prisma
  }

  // 3. Fallback for Edge build time
  // During `next build`, Next.js evaluates edge routes without providing the Cloudflare env.
  // Instantiating standard PrismaClient here would throw PrismaClientValidationError.
  // We return a proxy that safely absorbs build-time queries without crashing.
  globalForPrisma.prisma = new Proxy({} as any, {
    get(target, prop) {
      if (prop === '$connect' || prop === '$disconnect' || prop === '$transaction') {
        return async () => {};
      }
      if (typeof prop === 'string' && !prop.startsWith('$')) {
        return {
          findMany: async () => [],
          findUnique: async () => null,
          findFirst: async () => null,
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => ({}),
          count: async () => 0,
        };
      }
      return undefined;
    }
  });

  return globalForPrisma.prisma as any
}

// Convenience export for components that still statically import it.
// In edge runtime, this might fallback to Node.js proxy if not careful,
// so it's better to use getPrisma() inside function bodies.
export const prisma = getPrisma()
