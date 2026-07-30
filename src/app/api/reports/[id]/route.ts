import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { calculateCompleteness } from '@/lib/utils'

// GET /api/reports/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getPrisma()
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      author: true,
      school: true,
      project: true,
      budget: true,
      pdcaItems: { orderBy: { order: 'asc' } },
      objectives: { orderBy: { order: 'asc' } },
      achievementScore: true,
      satisfactionSurvey: { include: { answers: true } },
      reportSummary: true,
      evidenceDocs: { include: { files: true } },
      activityPhotos: { orderBy: { order: 'asc' } },
      signatories: true,
      standards: { orderBy: { order: 'asc' } },
      comments: true,
    },
  })

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(report)
}

// PATCH /api/reports/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const prisma = getPrisma()

  // Update main report
  const report = await prisma.report.update({
    where: { id },
    data: {
      title: body.title,
      activityName: body.activityName,
      fiscalYear: body.fiscalYear,
      workGroup: body.workGroup,
      status: body.status,
      completeness: body.completeness,
      preface: body.preface,
      lastSavedAt: new Date(),
    },
  })

  // Upsert Budget
  if (body.approved !== undefined) {
    await prisma.budget.upsert({
      where: { reportId: id },
      update: {
        budgetType: body.budgetType,
        approved: body.approved || 0,
        used: body.used || 0,
        remaining: body.remaining || (body.approved || 0) - (body.used || 0),
      },
      create: {
        reportId: id,
        budgetType: body.budgetType || '',
        approved: body.approved || 0,
        used: body.used || 0,
        remaining: body.remaining || (body.approved || 0) - (body.used || 0),
      },
    })
  }

  // Upsert Project
  if (body.responsiblePerson !== undefined) {
    await prisma.project.upsert({
      where: { reportId: id },
      update: {
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
        cancellationReason: body.cancellationReason,
      },
      create: {
        reportId: id,
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
        cancellationReason: body.cancellationReason,
      },
    })
  }

  // Upsert PDCA Items (delete + recreate)
  if (body.pdcaItems) {
    await prisma.pdcaItem.deleteMany({ where: { reportId: id } })
    const allItems: any[] = []
    let order = 0
    for (const phase of ['P', 'D', 'C', 'A']) {
      for (const item of body.pdcaItems[phase] || []) {
        allItems.push({
          reportId: id,
          phase,
          activity: item.activity,
          startDate: item.startDate,
          endDate: item.endDate,
          responsible: item.responsible,
          order: order++,
        })
      }
    }
    if (allItems.length > 0) {
      await prisma.pdcaItem.createMany({ data: allItems })
    }
  }

  // Upsert Objectives
  if (body.objectives) {
    await prisma.objective.deleteMany({ where: { reportId: id } })
    if (body.objectives.length > 0) {
      await prisma.objective.createMany({
        data: body.objectives.map((obj: any, idx: number) => ({
          reportId: id,
          objective: obj.objective,
          quantitativeTarget: obj.quantitativeTarget,
          qualitativeTarget: obj.qualitativeTarget,
          quantitativeResult: obj.quantitativeResult,
          qualitativeResult: obj.qualitativeResult,
          successPercent: obj.successPercent || 0,
          order: idx,
        })),
      })
    }
  }

  // Upsert Achievement Score
  if (body.qualityPercent !== undefined) {
    await prisma.achievementScore.upsert({
      where: { reportId: id },
      update: {
        qualityPercent: body.qualityPercent,
        qualityLevel: body.qualityLevel,
        quantityTarget: body.quantityTarget,
        quantityActual: body.quantityActual,
        quantityPercent: body.quantityPercent,
        quantityLevel: body.quantityLevel,
      },
      create: {
        reportId: id,
        qualityPercent: body.qualityPercent || 0,
        quantityTarget: body.quantityTarget,
        quantityActual: body.quantityActual,
        quantityPercent: body.quantityPercent,
      },
    })
  }

  // Upsert Report Summary
  if (body.strengths !== undefined || body.improvements !== undefined) {
    await prisma.reportSummary.upsert({
      where: { reportId: id },
      update: {
        strengths: body.strengths,
        improvements: body.improvements,
        suggestions: body.suggestions,
      },
      create: {
        reportId: id,
        strengths: body.strengths || '',
        improvements: body.improvements || '',
        suggestions: body.suggestions || '',
      },
    })
  }

  // Upsert Signatories
  if (body.signatories) {
    for (const role of ['REPORTER', 'PLAN_HEAD', 'PRINCIPAL']) {
      const sig = body.signatories[role]
      if (sig?.name) {
        const existing = await prisma.signatory.findFirst({ where: { reportId: id, role } })
        if (existing) {
          await prisma.signatory.update({
            where: { id: existing.id },
            data: { name: sig.name, position: sig.position, academicStanding: sig.academicStanding },
          })
        } else {
          await prisma.signatory.create({
            data: { reportId: id, role, name: sig.name, position: sig.position, academicStanding: sig.academicStanding },
          })
        }
      }
    }
  }

  return NextResponse.json(report)
}

// DELETE /api/reports/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getPrisma()
  await prisma.report.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
 
export const runtime = 'edge'; 
