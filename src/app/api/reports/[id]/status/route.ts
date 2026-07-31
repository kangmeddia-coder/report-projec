import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateReportStatus } from '@/lib/db'

// POST /api/reports/[id]/status
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const body = await req.json()

  if (!body.status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 })
  }

  const updated = await updateReportStatus(id, body.status, body.comment, user.id)
  return NextResponse.json(updated)
}
