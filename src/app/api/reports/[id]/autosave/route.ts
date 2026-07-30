import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// POST /api/reports/[id]/autosave
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const prisma = getPrisma()

  await prisma.autoSave.upsert({
    where: { reportId: id },
    update: { data: JSON.stringify(body.data), savedAt: new Date() },
    create: { reportId: id, data: JSON.stringify(body.data) },
  })

  await prisma.report.update({
    where: { id },
    data: { lastSavedAt: new Date() },
  })

  return NextResponse.json({ success: true, savedAt: new Date() })
}
