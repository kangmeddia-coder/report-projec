import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  try {
    const ctx = getCloudflareContext()
    const d1 = ctx?.env?.school_db as any

    if (!d1) {
      return NextResponse.json({ error: 'No D1 binding found' })
    }

    // Query D1 directly (bypass Prisma) to verify data exists
    const usersResult = await d1.prepare('SELECT id, email, password FROM "User" LIMIT 5').all()
    const tablesResult = await d1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()

    return NextResponse.json({
      tables: tablesResult?.results,
      users: usersResult?.results?.map((u: any) => ({
        id: u.id,
        email: u.email,
        passwordStart: u.password?.substring(0, 15) + '...'
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 800) }, { status: 500 })
  }
}
