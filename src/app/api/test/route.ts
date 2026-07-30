import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { compare } from 'bcrypt-ts'

export async function GET() {
  try {
    const d1_status = !!(process.env as any).school_db
    const prisma = getPrisma()
    
    let user = null
    let dbError = null
    let rawQueryError = null;
    let proxy = typeof prisma === 'object' && typeof (prisma as any).$transaction === 'function' ? false : true;

    try {
      user = await prisma.user.findUnique({
        where: { email: 'admin@school.ac.th' }
      })
    } catch (e: any) {
      dbError = e.message
    }
    
    let bcryptResult = null
    let bcryptError = null
    try {
      if (user) {
        bcryptResult = await compare('admin1234', user.password)
      }
    } catch (e: any) {
      bcryptError = e.message
    }
    
    return NextResponse.json({
      d1_status,
      user_found: !!user,
      dbError,
      bcryptResult,
      bcryptError,
      proxy
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
