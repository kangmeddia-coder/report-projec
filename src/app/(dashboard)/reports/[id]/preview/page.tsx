import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { getStatusLabel, getStatusColor, getSatisfactionLevel, formatCurrency, getQualityLevel } from '@/lib/utils'
import Link from 'next/link'
import PrintButton from '@/components/report/PrintButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPreviewPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')

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
      satisfactionSurvey: { include: { answers: { orderBy: { questionNo: 'asc' } } } },
      reportSummary: true,
      evidenceDocs: true,
      signatories: true,
    },
  })

  if (!report) notFound()

  const pdcaByPhase = {
    P: report.pdcaItems.filter(i => i.phase === 'P'),
    D: report.pdcaItems.filter(i => i.phase === 'D'),
    C: report.pdcaItems.filter(i => i.phase === 'C'),
    A: report.pdcaItems.filter(i => i.phase === 'A'),
  }

  const sigReporter = report.signatories.find(s => s.role === 'REPORTER')
  const sigPlanHead = report.signatories.find(s => s.role === 'PLAN_HEAD')
  const sigPrincipal = report.signatories.find(s => s.role === 'PRINCIPAL')

  const totalSatisfactionAvg = report.satisfactionSurvey?.avgTotal || 0

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar - no print */}
      <div className="no-print bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="text-slate-500 hover:text-slate-700 text-sm">← กลับ</Link>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
            {getStatusLabel(report.status)}
          </span>
          <span className="text-sm text-slate-500">ความสมบูรณ์: {report.completeness}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/reports/${id}`} className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
            ✏️ แก้ไข
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* A4 Document */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-xl rounded-sm" style={{ fontFamily: 'Sarabun, sans-serif', fontSize: '16px', lineHeight: '1.8' }}>

          {/* ===== หน้าปก ===== */}
          <div className="a4-preview-page border-b-2 border-dashed border-slate-200" style={{ padding: '60px 70px', minHeight: '700px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <span className="text-4xl">🏫</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">รายงานผลการดำเนินงาน</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-3 max-w-2xl leading-tight">{report.title}</h1>
            <p className="text-lg text-slate-700 mb-6">{report.activityName}</p>
            <div className="space-y-1 text-sm text-slate-600">
              <p>ปีงบประมาณ พ.ศ. {report.fiscalYear}</p>
              <p>{report.workGroup || ''}</p>
              <p className="mt-4 font-medium">{report.school?.name || ''}</p>
              <p>{report.school?.district || ''}</p>
              <p>{report.school?.affiliation || ''}</p>
            </div>
          </div>

          {/* ===== ส่วนที่ 1: ข้อมูลพื้นฐาน ===== */}
          <div className="p-10 border-b border-slate-100">
            <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 1 ข้อมูลพื้นฐาน</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ['ชื่อโครงการ', report.title],
                  ['ชื่อกิจกรรม', report.activityName],
                  ['ปีงบประมาณ', `พ.ศ. ${report.fiscalYear}`],
                  ['กลุ่มงาน/กลุ่มสาระฯ', report.workGroup || '-'],
                  ['ผู้รับผิดชอบ', report.project?.responsiblePerson || '-'],
                  ['ตำแหน่ง', report.project?.position || '-'],
                  ['โรงเรียน', report.project?.schoolName || report.school?.name || '-'],
                  ['สำนักงานเขตพื้นที่ฯ', report.project?.district || report.school?.district || '-'],
                  ['หน่วยงานต้นสังกัด', report.project?.affiliation || '-'],
                  ['กระทรวง', report.project?.ministry || '-'],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-2 pr-4 text-slate-500 w-52 font-medium">{label}</td>
                    <td className="py-2 text-slate-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== ส่วนที่ 2: สนองกลยุทธ์ ===== */}
          {report.project && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 2 ข้อมูลโครงการ</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['สนองกลยุทธ์ข้อที่', report.project.strategyItem ? `${report.project.strategyItem} — ${report.project.strategyDetail || ''}` : '-'],
                    ['สนองพันธกิจข้อที่', report.project.missionItem ? `${report.project.missionItem} — ${report.project.missionDetail || ''}` : '-'],
                    ['สนองมาตรฐาน', report.project.standardRef || '-'],
                    ['สถานะการดำเนินงาน', report.project.implementationStatus === 'COMPLETED' ? '✅ ดำเนินการเสร็จแล้ว' : `❌ ไม่ได้ดำเนินการ: ${report.project.cancellationReason || ''}`],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-2 pr-4 text-slate-500 w-52 font-medium">{label}</td>
                      <td className="py-2 text-slate-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== งบประมาณ ===== */}
          {report.budget && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 3 งบประมาณ</h2>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div className="border rounded-xl p-4 bg-blue-50">
                  <p className="text-xs text-blue-500 mb-1">งบที่ได้รับอนุมัติ</p>
                  <p className="text-xl font-bold text-blue-800">{formatCurrency(report.budget.approved)}</p>
                </div>
                <div className="border rounded-xl p-4 bg-orange-50">
                  <p className="text-xs text-orange-500 mb-1">งบที่ใช้ไป</p>
                  <p className="text-xl font-bold text-orange-800">{formatCurrency(report.budget.used)}</p>
                </div>
                <div className="border rounded-xl p-4 bg-green-50">
                  <p className="text-xs text-green-500 mb-1">งบคงเหลือ</p>
                  <p className="text-xl font-bold text-green-800">{formatCurrency(report.budget.remaining)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">ประเภทเงิน: {report.budget.budgetType || '-'}</p>
            </div>
          )}

          {/* ===== PDCA ===== */}
          {report.pdcaItems.length > 0 && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 4 วิธีดำเนินการโครงการ (PDCA)</h2>
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-700 text-white text-xs">
                    <th className="px-3 py-2 text-left">ขั้นตอน</th>
                    <th className="px-3 py-2 text-left">กิจกรรม</th>
                    <th className="px-3 py-2 text-left w-24">เริ่ม</th>
                    <th className="px-3 py-2 text-left w-24">สิ้นสุด</th>
                    <th className="px-3 py-2 text-left">ผู้รับผิดชอบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['P', 'D', 'C', 'A'].map(phase => {
                    const phaseItems = pdcaByPhase[phase as keyof typeof pdcaByPhase]
                    const phaseColors: Record<string, string> = {
                      P: 'bg-blue-50',
                      D: 'bg-green-50',
                      C: 'bg-yellow-50',
                      A: 'bg-purple-50',
                    }
                    const phaseLabels: Record<string, string> = {
                      P: 'P: วางแผน',
                      D: 'D: ดำเนิน',
                      C: 'C: ประเมิน',
                      A: 'A: สรุปผล',
                    }
                    return phaseItems.map((item, i) => (
                      <tr key={item.id} className={phaseColors[phase]}>
                        <td className="px-3 py-2 font-medium text-xs">{i === 0 ? phaseLabels[phase] : ''}</td>
                        <td className="px-3 py-2">{item.activity}</td>
                        <td className="px-3 py-2 text-xs">{item.startDate}</td>
                        <td className="px-3 py-2 text-xs">{item.endDate}</td>
                        <td className="px-3 py-2 text-xs">{item.responsible}</td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== วัตถุประสงค์ ===== */}
          {report.objectives.length > 0 && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 5 สรุปผลตามวัตถุประสงค์</h2>
              <table className="w-full text-sm border border-slate-200">
                <thead>
                  <tr className="bg-slate-700 text-white text-xs">
                    <th className="px-3 py-2 text-left">วัตถุประสงค์</th>
                    <th className="px-3 py-2 text-left">เป้าหมายเชิงปริมาณ</th>
                    <th className="px-3 py-2 text-left">ผลสำเร็จ</th>
                    <th className="px-3 py-2 text-center w-24">ร้อยละ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.objectives.map(obj => (
                    <tr key={obj.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">{obj.objective}</td>
                      <td className="px-3 py-2 text-xs">{obj.quantitativeTarget}</td>
                      <td className="px-3 py-2 text-xs">{obj.quantitativeResult}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-bold text-blue-700">{obj.successPercent || 0}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== ความสำเร็จ + ความพึงพอใจ ===== */}
          {report.achievementScore && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 6 ความสำเร็จและความพึงพอใจ</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-slate-700 mb-2">ด้านคุณภาพ</h3>
                  <p className="text-3xl font-bold text-blue-700">{report.achievementScore.qualityPercent || 0}%</p>
                  <p className="text-sm text-slate-500">{getQualityLevel(report.achievementScore.qualityPercent || 0)}</p>
                </div>
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-slate-700 mb-2">ด้านปริมาณ</h3>
                  <p className="text-3xl font-bold text-green-700">{report.achievementScore.quantityPercent || 0}%</p>
                  <p className="text-sm text-slate-500">เป้าหมาย {report.achievementScore.quantityTarget} / จริง {report.achievementScore.quantityActual}</p>
                </div>
              </div>
              {totalSatisfactionAvg > 0 && (
                <div className="border rounded-xl p-4 bg-amber-50">
                  <h3 className="font-semibold text-slate-700 mb-1">ความพึงพอใจเฉลี่ยรวม</h3>
                  <p className="text-3xl font-bold text-amber-700">{totalSatisfactionAvg.toFixed(2)} / 5.00</p>
                  <p className="text-sm text-slate-500">{getSatisfactionLevel(totalSatisfactionAvg)}</p>
                </div>
              )}
            </div>
          )}

          {/* ===== สรุปภาพรวม ===== */}
          {report.reportSummary && (
            <div className="p-10 border-b border-slate-100">
              <h2 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-5">ส่วนที่ 7 สรุปภาพรวม</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-700 mb-1">✅ จุดเด่น</h3>
                  <p className="text-slate-700 whitespace-pre-line">{report.reportSummary.strengths || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-700 mb-1">🔧 จุดที่ควรพัฒนา</h3>
                  <p className="text-slate-700 whitespace-pre-line">{report.reportSummary.improvements || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">💡 ข้อเสนอแนะ</h3>
                  <p className="text-slate-700 whitespace-pre-line">{report.reportSummary.suggestions || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== ผู้ลงนาม ===== */}
          <div className="p-10">
            <div className="grid grid-cols-3 gap-8 text-center mt-12">
              {[
                { sig: sigReporter, label: 'ผู้รายงาน' },
                { sig: sigPlanHead, label: 'หัวหน้างานนโยบายและแผน' },
                { sig: sigPrincipal, label: 'ผู้อำนวยการโรงเรียน' },
              ].map(({ sig, label }) => (
                <div key={label}>
                  <div className="border-b border-dashed border-slate-400 pb-2 mb-2 min-h-[60px] flex items-end justify-center">
                    <span className="text-slate-400 text-sm">(ลายมือชื่อ)</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{sig?.name ? `(${sig.name})` : '(................................)'}</p>
                  <p className="text-xs text-slate-500">{sig?.position || label}</p>
                  {sig?.academicStanding && <p className="text-xs text-slate-400">{sig.academicStanding}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
 
 
