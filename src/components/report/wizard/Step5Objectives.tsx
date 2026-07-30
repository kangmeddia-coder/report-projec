'use client'
import { useState } from 'react'
import { getQualityLevel, getQualityLevelColor } from '@/lib/utils'

interface Obj {
  id: string
  objective: string
  quantitativeTarget: string
  qualitativeTarget: string
  quantitativeResult: string
  qualitativeResult: string
  successPercent: number
}

export default function Step5Objectives({ formData, onComplete }: any) {
  const [objectives, setObjectives] = useState<Obj[]>(
    formData.objectives?.length > 0 ? formData.objectives : [{ id: '1', objective: '', quantitativeTarget: '', qualitativeTarget: '', quantitativeResult: '', qualitativeResult: '', successPercent: 0 }]
  )

  const addRow = () => setObjectives(prev => [...prev, { id: Date.now().toString(), objective: '', quantitativeTarget: '', qualitativeTarget: '', quantitativeResult: '', qualitativeResult: '', successPercent: 0 }])
  const updateRow = (id: string, field: string, value: any) => setObjectives(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o))
  const removeRow = (id: string) => setObjectives(prev => prev.filter(o => o.id !== id))

  return (
    <form onSubmit={e => { e.preventDefault(); onComplete({ objectives }) }} className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><span>🎯</span> สรุปผลตามวัตถุประสงค์และเป้าหมาย</h2>
        <button type="button" onClick={addRow} className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">+ เพิ่มวัตถุประสงค์</button>
      </div>
      <div className="space-y-4">
        {objectives.map((obj, idx) => (
          <div key={obj.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">วัตถุประสงค์ที่ {idx + 1}</span>
              {objectives.length > 1 && <button type="button" onClick={() => removeRow(obj.id)} className="text-red-400 hover:text-red-600 text-sm">ลบ ×</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">วัตถุประสงค์</label>
                <textarea value={obj.objective} onChange={e => updateRow(obj.id, 'objective', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" placeholder="เพื่อ..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">เป้าหมายเชิงปริมาณ</label>
                <input value={obj.quantitativeTarget} onChange={e => updateRow(obj.id, 'quantitativeTarget', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">เป้าหมายเชิงคุณภาพ</label>
                <input value={obj.qualitativeTarget} onChange={e => updateRow(obj.id, 'qualitativeTarget', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ผลสำเร็จเชิงปริมาณ</label>
                <input value={obj.quantitativeResult} onChange={e => updateRow(obj.id, 'quantitativeResult', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ผลสำเร็จเชิงคุณภาพ</label>
                <input value={obj.qualitativeResult} onChange={e => updateRow(obj.id, 'qualitativeResult', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">ร้อยละความสำเร็จ</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" value={obj.successPercent} onChange={e => updateRow(obj.id, 'successPercent', Number(e.target.value))} className="flex-1" />
                  <span className={`text-sm font-bold px-2 py-1 rounded ${getQualityLevelColor(obj.successPercent)}`}>{obj.successPercent}% — {getQualityLevel(obj.successPercent)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
