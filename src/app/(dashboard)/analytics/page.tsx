import { auth } from '@/lib/auth'
import { getD1 } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function getAnalyticsData(userId: string, role: string) {
  const d1 = getD1()
  if (!d1) return null

  const isTeacher = role === 'TEACHER'
  const whereClause = isTeacher ? 'WHERE r.authorId = ?' : ''
  const args = isTeacher ? [userId] : []

  const [reportsResult, budgetsResult] = await Promise.all([
    d1.prepare(`
      SELECT r.id, r.status, r.completeness, r.fiscalYear, r.workGroup,
             r.createdAt, r.updatedAt, u.name as authorName
      FROM "Report" r
      LEFT JOIN "User" u ON r.authorId = u.id
      ${whereClause}
    `).bind(...args).all(),
    d1.prepare(`
      SELECT b.approved, b.used, b.remaining, r.fiscalYear, r.workGroup, r.status
      FROM "Budget" b
      JOIN "Report" r ON b.reportId = r.id
      ${isTeacher ? 'WHERE r.authorId = ?' : ''}
    `).bind(...args).all(),
  ])

  const reports = reportsResult?.results || []
  const budgets = budgetsResult?.results || []

  // Status breakdown
  const statusMap: Record<string, { label: string; color: string; count: number }> = {
    DRAFT: { label: 'แบบร่าง', color: '#94a3b8', count: 0 },
    IN_PROGRESS: { label: 'กำลังจัดทำ', color: '#3b82f6', count: 0 },
    SUBMITTED: { label: 'ส่งตรวจสอบ', color: '#f59e0b', count: 0 },
    NEEDS_REVISION: { label: 'ต้องแก้ไข', color: '#ef4444', count: 0 },
    APPROVED: { label: 'อนุมัติ', color: '#10b981', count: 0 },
    COMPLETED: { label: 'เสร็จสมบูรณ์', color: '#059669', count: 0 },
  }
  reports.forEach((r: any) => {
    if (statusMap[r.status]) statusMap[r.status].count++
  })

  // By fiscal year
  const byYear: Record<string, number> = {}
  reports.forEach((r: any) => {
    const yr = r.fiscalYear || 'ไม่ระบุ'
    byYear[yr] = (byYear[yr] || 0) + 1
  })

  // By work group
  const byGroup: Record<string, number> = {}
  reports.forEach((r: any) => {
    const grp = r.workGroup || 'ไม่ระบุกลุ่ม'
    byGroup[grp] = (byGroup[grp] || 0) + 1
  })

  // Budget totals
  const totalApproved = budgets.reduce((s: number, b: any) => s + (b.approved || 0), 0)
  const totalUsed = budgets.reduce((s: number, b: any) => s + (b.used || 0), 0)
  const totalRemaining = budgets.reduce((s: number, b: any) => s + (b.remaining || 0), 0)

  // Budget by fiscal year
  const budgetByYear: Record<string, { approved: number; used: number }> = {}
  budgets.forEach((b: any) => {
    const yr = b.fiscalYear || 'ไม่ระบุ'
    if (!budgetByYear[yr]) budgetByYear[yr] = { approved: 0, used: 0 }
    budgetByYear[yr].approved += b.approved || 0
    budgetByYear[yr].used += b.used || 0
  })

  // Completeness average
  const avgCompleteness = reports.length > 0
    ? Math.round(reports.reduce((s: number, r: any) => s + (r.completeness || 0), 0) / reports.length)
    : 0

  return {
    total: reports.length,
    statusMap,
    byYear: Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0])),
    byGroup: Object.entries(byGroup).sort((a, b) => b[1] - a[1]).slice(0, 10),
    totalApproved, totalUsed, totalRemaining,
    budgetByYear: Object.entries(budgetByYear).sort((a, b) => a[0].localeCompare(b[0])),
    avgCompleteness,
    budgetUsagePercent: totalApproved > 0 ? Math.round((totalUsed / totalApproved) * 100) : 0,
  }
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const data = await getAnalyticsData(user.id, user.role)

  const maxGroupCount = data ? Math.max(...data.byGroup.map(([, c]) => c), 1) : 1
  const maxYearCount = data ? Math.max(...data.byYear.map(([, c]) => c), 1) : 1

  return (
    <div className="p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">วิเคราะห์ข้อมูล</h1>
        <p className="text-slate-500 text-sm mt-1">ภาพรวมสถิติและการวิเคราะห์รายงานผลโครงการ</p>
      </div>

      {!data || data.total === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-500 font-medium text-lg">ยังไม่มีข้อมูลสำหรับวิเคราะห์</p>
          <p className="text-slate-400 text-sm mt-2">เริ่มสร้างรายงานเพื่อดูสถิติที่นี่</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'รายงานทั้งหมด', value: data.total, icon: '📋', sub: 'ฉบับ', color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'ความสมบูรณ์เฉลี่ย', value: `${data.avgCompleteness}%`, icon: '⚡', sub: 'เฉลี่ย', color: 'bg-violet-50 border-violet-100 text-violet-700' },
              { label: 'งบประมาณรวม', value: formatCurrency(data.totalApproved), icon: '💰', sub: 'ได้รับอนุมัติ', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
              { label: 'อัตราใช้งบ', value: `${data.budgetUsagePercent}%`, icon: '📈', sub: 'ของงบทั้งหมด', color: `${data.budgetUsagePercent > 90 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}` },
            ].map((kpi) => (
              <div key={kpi.label} className={`rounded-2xl border p-5 ${kpi.color}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm font-semibold mt-0.5">{kpi.label}</p>
                <p className="text-xs opacity-60 mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Status Breakdown + Budget Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-2">
                <span>📊</span> สถานะรายงาน
              </h2>
              <div className="space-y-3">
                {Object.values(data.statusMap).filter(s => s.count > 0 || true).map((status) => (
                  <div key={status.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                        <span className="text-slate-600">{status.label}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{status.count} ฉบับ</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: data.total > 0 ? `${(status.count / data.total) * 100}%` : '0%',
                          backgroundColor: status.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-2">
                <span>💰</span> สรุปงบประมาณ
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-blue-700 font-medium">ได้รับอนุมัติ</span>
                  <span className="text-base font-bold text-blue-800">{formatCurrency(data.totalApproved)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                  <span className="text-sm text-orange-700 font-medium">ใช้ไปแล้ว</span>
                  <span className="text-base font-bold text-orange-800">{formatCurrency(data.totalUsed)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm text-emerald-700 font-medium">คงเหลือ</span>
                  <span className="text-base font-bold text-emerald-800">{formatCurrency(data.totalRemaining)}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>อัตราการใช้งบ</span>
                    <span className="font-medium">{data.budgetUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${data.budgetUsagePercent > 90 ? 'bg-red-500' : data.budgetUsagePercent > 70 ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(data.budgetUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* By Work Group */}
          {data.byGroup.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-2">
                <span>🏫</span> รายงานตามกลุ่มงาน/กลุ่มสาระ (Top 10)
              </h2>
              <div className="space-y-3">
                {data.byGroup.map(([group, count]) => (
                  <div key={group} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 w-64 truncate flex-shrink-0" title={group}>{group}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                      <div
                        className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                        style={{ width: `${(count / maxGroupCount) * 100}%` }}
                      />
                      <span className="absolute right-3 top-0 h-6 flex items-center text-xs font-bold text-slate-700">
                        {count} ฉบับ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Fiscal Year */}
          {data.byYear.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-5 flex items-center gap-2">
                <span>📅</span> รายงานตามปีงบประมาณ
              </h2>
              <div className="flex items-end gap-4 h-40">
                {data.byYear.map(([year, count]) => (
                  <div key={year} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 min-h-[8px]"
                      style={{ height: `${Math.max((count / maxYearCount) * 100, 8)}px` }}
                    />
                    <span className="text-xs text-slate-500 truncate w-full text-center">{year}</span>
                  </div>
                ))}
              </div>

              {/* Budget by year */}
              {data.budgetByYear.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-600 mb-4">งบประมาณตามปีงบประมาณ</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                          <th className="text-left py-2 pr-4">ปีงบประมาณ</th>
                          <th className="text-right py-2 pr-4">งบที่อนุมัติ</th>
                          <th className="text-right py-2 pr-4">งบที่ใช้</th>
                          <th className="text-right py-2">อัตราการใช้</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.budgetByYear.map(([year, budget]) => {
                          const pct = budget.approved > 0 ? Math.round((budget.used / budget.approved) * 100) : 0
                          return (
                            <tr key={year} className="hover:bg-slate-50">
                              <td className="py-3 pr-4 font-medium text-slate-800">{year}</td>
                              <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(budget.approved)}</td>
                              <td className="py-3 pr-4 text-right text-slate-600">{formatCurrency(budget.used)}</td>
                              <td className="py-3 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${pct > 90 ? 'bg-red-100 text-red-700' : pct > 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {pct}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
