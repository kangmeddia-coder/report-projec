import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// DO NOT cache prisma globally in Cloudflare Workers —
// getCloudflareContext() must be called per-request and the D1 binding
// is only available inside an active request context (not at module init time).
// Caching causes the build-time fallback proxy to persist for all real requests.

export function getPrisma(): PrismaClient {
  // 1. Cloudflare Workers runtime — must call getCloudflareContext() fresh each time
  try {
    const ctx = getCloudflareContext()
    if (ctx?.env?.school_db) {
      const adapter = new PrismaD1(ctx.env.school_db as any)
      return new PrismaClient({ adapter: adapter as any })
    }
  } catch (_e) {
    // Outside of a Cloudflare request context (e.g. during next build)
  }

  // 2. Local Node.js development
  if (process.env.NODE_ENV !== 'production') {
    return new PrismaClient()
  }

  // 3. Build-time fallback — returns a no-op proxy so next build doesn't crash
  const proxy: any = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') return async () => {}
      if (prop === '$transaction') return async (fn: any) => fn(proxy)
      return new Proxy({}, {
        get(_t, _method) {
          return async () => null
        }
      })
    }
  })
  return proxy
}
