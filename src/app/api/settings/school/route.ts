import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateSchool } from '@/lib/db'

// POST /api/settings/school
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const body = await req.json()

  const schoolId = user.schoolId || 'school-001'
  const updated = await updateSchool(schoolId, body)
  return NextResponse.json(updated)
}
