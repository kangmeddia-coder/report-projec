import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getPrisma } from '@/lib/prisma'
import { compare } from 'bcrypt-ts'

export async function GET() {
  try {
    const ctx = getCloudflareContext()
    const hasD1 = !!ctx?.env?.school_db

    const prisma = getPrisma()
    
    let user: any = null
    let dbError: string | null = null
    try {
      user = await prisma.user.findUnique({
        where: { email: 'admin@school.ac.th' },
        select: { id: true, email: true, password: true }
      })
    } catch (e: any) {
      dbError = e.message
    }

    let bcryptOk: boolean | null = null
    let bcryptError: string | null = null
    if (user) {
      try {
        bcryptOk = await compare('admin1234', user.password)
      } catch (e: any) {
        bcryptError = e.message
      }
    }

    return NextResponse.json({
      hasD1,
      userFound: !!user,
      userId: user?.id,
      passwordHash: user?.password?.substring(0, 10) + '...',
      bcryptOk,
      dbError,
      bcryptError,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
  }
}
