import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getD1, newId } from '@/lib/db'

// POST /api/reports/[id]/autosave
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const d1 = getD1()
  if (!d1) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const now = new Date().toISOString()
  const existing = await d1.prepare(`SELECT id FROM "AutoSave" WHERE reportId=?`).bind(id).first()

  if (existing) {
    await d1.prepare(`UPDATE "AutoSave" SET data=?, savedAt=? WHERE reportId=?`)
      .bind(JSON.stringify(body.data), now, id).run()
  } else {
    await d1.prepare(`INSERT INTO "AutoSave" (id, reportId, data, savedAt) VALUES (?,?,?,?)`)
      .bind(newId(), id, JSON.stringify(body.data), now).run()
  }

  await d1.prepare(`UPDATE "Report" SET lastSavedAt=?, updatedAt=? WHERE id=?`)
    .bind(now, now, id).run()

  return NextResponse.json({ success: true, savedAt: now })
}
