import { auth } from '@/lib/auth'
import { getReportById } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')

  const report = await getReportById(id)
  if (!report) notFound()

  const pdcaItems: Record<string, any[]> = { P: [], D: [], C: [], A: [] }
  for (const item of (report.pdcaItems || [])) {
    const p = (item as any).phase
    if (!pdcaItems[p]) pdcaItems[p] = []
    pdcaItems[p].push({ id: (item as any).id, activity: (item as any).activity, startDate: (item as any).startDate, endDate: (item as any).endDate, responsible: (item as any).responsible })
  }

  const signatories: Record<string, any> = {}
  for (const sig of (report.signatories || [])) {
    signatories[(sig as any).role] = { name: (sig as any).name, position: (sig as any).position, academicStanding: (sig as any).academicStanding }
  }

  const evidenceDocs: Record<string, boolean> = {}
  for (const doc of (report.evidenceDocs || [])) {
    evidenceDocs[(doc as any).docType] = (doc as any).hasDoc
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">แก้ไขรายงาน</h1>
          <p className="text-sm text-slate-500 mt-1">{(report as any).title}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/reports/${id}/preview`} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50">
            👁️ ดูตัวอย่าง
          </Link>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
        <p className="text-amber-700 font-medium">🔧 หน้าแก้ไขรายงาน</p>
        <p className="text-amber-600 text-sm mt-1">Feature แก้ไขรายงานอยู่ระหว่างพัฒนา กดปุ่ม &quot;ดูตัวอย่าง&quot; เพื่อดูรายงาน</p>
        <Link href={`/reports/${id}/preview`} className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          ดูตัวอย่างรายงาน
        </Link>
      </div>
    </div>
  )
}
