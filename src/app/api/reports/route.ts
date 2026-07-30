import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// GET /api/reports
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const where = user.role === 'TEACHER' ? { authorId: user.id } : {}
  const prisma = getPrisma()

  const reports = await prisma.report.findMany({
    where,
    include: {
      author: { select: { name: true, email: true } },
      budget: true,
      _count: { select: { pdcaItems: true, objectives: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(reports)
}

// POST /api/reports
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const body = await req.json()
  const prisma = getPrisma()

  const report = await prisma.report.create({
    data: {
      title: body.title,
      activityName: body.activityName,
      fiscalYear: body.fiscalYear,
      workGroup: body.workGroup,
      status: body.status || 'IN_PROGRESS',
      completeness: body.completeness || 0,
      authorId: user.id,
      schoolId: user.schoolId,
      lastSavedAt: new Date(),
    },
  })

  // Create related records if data present
  if (body.approved !== undefined || body.budgetType) {
    await prisma.budget.create({
      data: {
        reportId: report.id,
        budgetType: body.budgetType || '',
        approved: body.approved || 0,
        used: body.used || 0,
        remaining: body.remaining || (body.approved || 0) - (body.used || 0),
      },
    })
  }

  if (body.responsiblePerson || body.strategyItem) {
    await prisma.project.create({
      data: {
        reportId: report.id,
        responsiblePerson: body.responsiblePerson,
        position: body.position,
        schoolName: body.schoolName,
        district: body.district,
        affiliation: body.affiliation,
        ministry: body.ministry,
        strategyItem: body.strategyItem,
        strategyDetail: body.strategyDetail,
        missionItem: body.missionItem,
        missionDetail: body.missionDetail,
        standardRef: body.standardRef,
        standardItem: body.standardItem,
        implementationStatus: body.implementationStatus || 'COMPLETED',
      },
    })
  }

  return NextResponse.json(report, { status: 201 })
}
