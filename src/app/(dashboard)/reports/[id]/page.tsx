import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')

  const prisma = getPrisma()
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      project: true,
      budget: true,
      pdcaItems: { orderBy: { order: 'asc' } },
      objectives: { orderBy: { order: 'asc' } },
      achievementScore: true,
      satisfactionSurvey: { include: { answers: true } },
      reportSummary: true,
      evidenceDocs: true,
      signatories: true,
    },
  })

  if (!report) notFound()

  // Build wizard initial data
  const pdcaItems: Record<string, any[]> = { P: [], D: [], C: [], A: [] }
  for (const item of report.pdcaItems) {
    if (!pdcaItems[item.phase]) pdcaItems[item.phase] = []
    pdcaItems[item.phase].push({ id: item.id, activity: item.activity, startDate: item.startDate, endDate: item.endDate, responsible: item.responsible })
  }

  const signatories: Record<string, any> = {}
  for (const sig of report.signatories) {
    signatories[sig.role] = { name: sig.name, position: sig.position, academicStanding: sig.academicStanding }
  }

  const evidenceDocs: Record<string, boolean> = {}
  for (const doc of report.evidenceDocs) {
    evidenceDocs[doc.docType] = doc.hasDoc
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">แก้ไขรายงาน</h1>
          <p className="text-sm text-slate-500 mt-1">{report.title}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/reports/${id}/preview`} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50">
            👁️ ดูตัวอย่าง
          </Link>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
        <p className="text-amber-700 font-medium">🔧 หน้าแก้ไขรายงาน</p>
        <p className="text-amber-600 text-sm mt-1">Feature แก้ไขรายงานอยู่ระหว่างพัฒนา กดปุ่ม "ดูตัวอย่าง" เพื่อดูรายงาน</p>
        <Link href={`/reports/${id}/preview`} className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          ดูตัวอย่างรายงาน
        </Link>
      </div>
    </div>
  )
}
 
export const runtime = 'edge'; 
