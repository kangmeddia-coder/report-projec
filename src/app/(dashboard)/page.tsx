import { auth } from '@/lib/auth'
import { getReports } from '@/lib/db'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData(userId: string, role: string) {
  const reports = await getReports(userId, role)
  const budgets = reports.map((r: any) => r.budget).filter(Boolean)

  const stats = {
    total: reports.length,
    draft: reports.filter((r: any) => r.status === 'DRAFT').length,
    inProgress: reports.filter((r: any) => r.status === 'IN_PROGRESS').length,
    submitted: reports.filter((r: any) => r.status === 'SUBMITTED').length,
    approved: reports.filter((r: any) => r.status === 'APPROVED').length,
    completed: reports.filter((r: any) => r.status === 'COMPLETED').length,
    totalBudgetApproved: budgets.reduce((s: number, b: any) => s + (b?.approved || 0), 0),
    totalBudgetUsed: budgets.reduce((s: number, b: any) => s + (b?.used || 0), 0),
    totalBudgetRemaining: budgets.reduce((s: number, b: any) => s + (b?.remaining || 0), 0),
  }

  return { reports, stats }
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any
  const { reports, stats } = await getDashboardData(user?.id, user?.role)

  const kpiCards = [
    { label: 'รายงานทั้งหมด', value: stats.total, icon: '📋', color: 'blue', sub: `${stats.inProgress} กำลังจัดทำ` },
    { label: 'แบบร่าง', value: stats.draft, icon: '📝', color: 'gray', sub: 'รอดำเนินการ' },
    { label: 'รอตรวจสอบ', value: stats.submitted, icon: '⏳', color: 'yellow', sub: 'ส่งแล้ว' },
    { label: 'เสร็จสมบูรณ์', value: stats.completed, icon: '✅', color: 'green', sub: `อนุมัติ ${stats.approved} ฉบับ` },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    gray: 'bg-gray-50 border-gray-100 text-gray-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  }

  const budgetPercent = stats.totalBudgetApproved > 0
    ? Math.round((stats.totalBudgetUsed / stats.totalBudgetApproved) * 100)
    : 0

  return (
    <div className="p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ด</h1>
          <p className="text-slate-500 text-sm mt-1">ภาพรวมรายงานผลโครงการ/กิจกรรม</p>
        </div>
        <Link
          href="/reports/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          สร้างรายงานใหม่
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-5 ${colorMap[card.color]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-3xl font-bold">{card.value}</span>
            </div>
            <p className="font-semibold text-sm">{card.label}</p>
            <p className="text-xs opacity-70 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>💰</span> สรุปงบประมาณรวม
        </h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">งบประมาณที่ได้รับอนุมัติ</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalBudgetApproved)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">งบประมาณที่ใช้ไป</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(stats.totalBudgetUsed)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">งบประมาณคงเหลือ</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalBudgetRemaining)}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>สัดส่วนการใช้งบประมาณ</span>
            <span>{budgetPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">รายการรายงานล่าสุด</h2>
          <Link href="/reports" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ดูทั้งหมด →
          </Link>
        </div>
        
        {reports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-slate-500 font-medium">ยังไม่มีรายงาน</p>
            <p className="text-slate-400 text-sm mt-1">กดปุ่ม &quot;สร้างรายงานใหม่&quot; เพื่อเริ่มต้น</p>
            <Link href="/reports/new" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              สร้างรายงานใหม่
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-semibold">ชื่อโครงการ</th>
                  <th className="px-6 py-3 text-left font-semibold">กิจกรรม</th>
                  <th className="px-6 py-3 text-left font-semibold">ปีงบประมาณ</th>
                  <th className="px-6 py-3 text-left font-semibold">ผู้รับผิดชอบ</th>
                  <th className="px-6 py-3 text-left font-semibold">ความสมบูรณ์</th>
                  <th className="px-6 py-3 text-left font-semibold">สถานะ</th>
                  <th className="px-6 py-3 text-left font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.slice(0, 10).map((report: any) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1 max-w-48">{report.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{report.workGroup || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 line-clamp-1 max-w-36">{report.activityName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">{report.fiscalYear}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{report.author?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${report.completeness}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{report.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/reports/${report.id}`}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline"
                        >
                          แก้ไข
                        </Link>
                        <Link
                          href={`/reports/${report.id}/preview`}
                          className="text-slate-500 hover:text-slate-700 text-xs font-medium hover:underline"
                        >
                          ดูตัวอย่าง
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
