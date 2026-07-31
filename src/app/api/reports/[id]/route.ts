import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getReportById, updateReport, deleteReport } from '@/lib/db'

// GET /api/reports/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const report = await getReportById(id)
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(report)
}

// PATCH /api/reports/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const report = await updateReport(id, body)
  return NextResponse.json(report)
}

// DELETE /api/reports/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await deleteReport(id)
  return NextResponse.json({ success: true })
}
