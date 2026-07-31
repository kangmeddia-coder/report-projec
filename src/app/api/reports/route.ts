import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getReports, createReport } from '@/lib/db'

// GET /api/reports
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const reports = await getReports(user.id, user.role)
  return NextResponse.json(reports)
}

// POST /api/reports
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const body = await req.json()

  const report = await createReport({
    title: body.title,
    activityName: body.activityName,
    fiscalYear: body.fiscalYear,
    workGroup: body.workGroup,
    status: body.status || 'IN_PROGRESS',
    completeness: body.completeness || 0,
    authorId: user.id,
    schoolId: user.schoolId,
  })

  return NextResponse.json(report, { status: 201 })
}
