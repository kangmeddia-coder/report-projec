import { auth } from '@/lib/auth'
import { getReportById, cleanObj } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditReportClient from '@/components/report/EditReportClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: PageProps) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) redirect('/login')

    const report = await getReportById(id)

    if (!report) {
      return (
        <div className="p-12 text-center max-w-xl mx-auto my-16 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่พบรายงานนี้ในระบบ</h2>
          <p className="text-slate-500 text-sm mb-6">รายงานที่คุณต้องการแก้ไขอาจถูกลบไปแล้ว หรือ รหัสรายงานไม่ถูกต้อง</p>
          <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md inline-block">
            ← กลับไปยังหน้ารายการรายงาน
          </Link>
        </div>
      )
    }

    const cleanData = cleanObj(report)
    return <EditReportClient report={cleanData} />
  } catch (err: any) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto my-16 bg-white rounded-2xl border border-red-200 shadow-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-800 mb-2">เกิดข้อผิดพลาดในการโหลดรายงาน</h2>
        <p className="text-slate-600 text-xs mb-4 font-mono bg-slate-100 p-3 rounded text-left overflow-x-auto whitespace-pre-wrap">{err?.stack || err?.message || String(err)}</p>
        <Link href="/reports" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md inline-block">
          ← กลับไปยังหน้ารายการรายงาน
        </Link>
      </div>
    )
  }
}
