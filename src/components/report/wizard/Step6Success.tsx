'use client'
import { useState } from 'react'
import { SATISFACTION_QUESTIONS } from '@/types'
import { getQualityLevel, getQualityLevelColor, getSatisfactionLevel } from '@/lib/utils'

export default function Step6Success({ formData, onComplete }: any) {
  const [qualityPercent, setQualityPercent] = useState<number>(formData.qualityPercent || 0)
  const [quantityTarget, setQuantityTarget] = useState<number>(formData.quantityTarget || 0)
  const [quantityActual, setQuantityActual] = useState<number>(formData.quantityActual || 0)
  const [scores, setScores] = useState<Record<number, number>>(formData.satisfactionScores || {})

  const quantityPercent = quantityTarget > 0 ? Math.round((quantityActual / quantityTarget) * 100) : 0

  const s1 = SATISFACTION_QUESTIONS.filter(q => q.section === 1)
  const s2 = SATISFACTION_QUESTIONS.filter(q => q.section === 2)
  const s3 = SATISFACTION_QUESTIONS.filter(q => q.section === 3)

  const avg = (qs: typeof SATISFACTION_QUESTIONS) => {
    const answered = qs.filter(q => scores[q.no])
    if (!answered.length) return 0
    return answered.reduce((s, q) => s + scores[q.no], 0) / answered.length
  }

  const totalAnswered = SATISFACTION_QUESTIONS.filter(q => scores[q.no])
  const totalAvg = totalAnswered.length > 0 ? totalAnswered.reduce((s, q) => s + scores[q.no], 0) / totalAnswered.length : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({
      qualityPercent,
      quantityTarget,
      quantityActual,
      quantityPercent,
      satisfactionScores: scores,
      satisfactionAvg: totalAvg,
    })
  }

  const ScoreSelector = ({ questionNo }: { questionNo: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => setScores(p => ({ ...p, [questionNo]: s }))}
          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
            scores[questionNo] === s
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-blue-100'
          }`}>{s}</button>
      ))}
    </div>
  )

  const sectionLabels = ['หมวดที่ 1 ด้านทรัพยากรที่ใช้', 'หมวดที่ 2 ประเมินกระบวนการดำเนินงาน', 'หมวดที่ 3 ประเมินผลการดำเนินงาน']

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><span>⭐</span> การประเมินความสำเร็จ</h2>

      {/* ด้านคุณภาพ */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-4">📊 ความสำเร็จด้านคุณภาพ</h3>
        <label className="block text-sm font-medium text-slate-700 mb-2">เปอร์เซ็นต์ผลสำเร็จด้านคุณภาพ</label>
        <div className="flex items-center gap-4">
          <input type="range" min="0" max="100" value={qualityPercent} onChange={e => setQualityPercent(Number(e.target.value))} className="flex-1" />
          <span className={`text-sm font-bold px-3 py-1 rounded-lg ${getQualityLevelColor(qualityPercent)}`}>{qualityPercent}% — {getQualityLevel(qualityPercent)}</span>
        </div>
      </div>

      {/* ด้านปริมาณ */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5">
        <h3 className="font-semibold text-green-800 mb-4">📈 ความสำเร็จด้านปริมาณ</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ค่าเป้าหมาย</label>
            <input type="number" min="0" value={quantityTarget} onChange={e => setQuantityTarget(Number(e.target.value))} className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ผลที่เกิดขึ้นจริง</label>
            <input type="number" min="0" value={quantityActual} onChange={e => setQuantityActual(Number(e.target.value))} className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex items-end">
            <div className={`w-full text-center py-2.5 rounded-lg text-sm font-bold ${getQualityLevelColor(quantityPercent)}`}>
              {quantityPercent}% — {getQualityLevel(quantityPercent)}
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Survey */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3">
          <h3 className="font-semibold">📋 แบบประเมินความพึงพอใจ (12 ข้อ)</h3>
          <div className="flex gap-3 text-xs text-slate-400 mt-1">
            <span>1=น้อยที่สุด</span><span>2=น้อย</span><span>3=ปานกลาง</span><span>4=มาก</span><span>5=มากที่สุด</span>
          </div>
        </div>
        <div className="p-5 space-y-6">
          {[s1, s2, s3].map((section, si) => (
            <div key={si}>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
                {sectionLabels[si]}
                {avg(section) > 0 && <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ค่าเฉลี่ย {avg(section).toFixed(2)} — {getSatisfactionLevel(avg(section))}</span>}
              </h4>
              <div className="space-y-3">
                {section.map(q => (
                  <div key={q.no} className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-600 flex-1">{q.no}. {q.question}</p>
                    <ScoreSelector questionNo={q.no} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {totalAvg > 0 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">ค่าเฉลี่ยรวมทั้งหมด</span>
              <span className="text-lg font-bold text-blue-700">{totalAvg.toFixed(2)} — {getSatisfactionLevel(totalAvg)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
