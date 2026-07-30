'use client'
import { useState } from 'react'
import { PDCA_PHASES } from '@/types'

interface PdcaItem {
  id: string
  activity: string
  startDate: string
  endDate: string
  responsible: string
}

export default function Step4Pdca({ formData, onComplete }: any) {
  const [items, setItems] = useState<Record<string, PdcaItem[]>>(
    formData.pdcaItems || { P: [], D: [], C: [], A: [] }
  )

  const addItem = (phase: string) => {
    setItems(prev => ({
      ...prev,
      [phase]: [...(prev[phase] || []), { id: Date.now().toString(), activity: '', startDate: '', endDate: '', responsible: '' }],
    }))
  }

  const updateItem = (phase: string, id: string, field: string, value: string) => {
    setItems(prev => ({
      ...prev,
      [phase]: prev[phase].map(item => item.id === id ? { ...item, [field]: value } : item),
    }))
  }

  const removeItem = (phase: string, id: string) => {
    setItems(prev => ({ ...prev, [phase]: prev[phase].filter(i => i.id !== id) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ pdcaItems: items })
  }

  const phaseColors: Record<string, string> = {
    P: 'border-blue-200 bg-blue-50',
    D: 'border-green-200 bg-green-50',
    C: 'border-yellow-200 bg-yellow-50',
    A: 'border-purple-200 bg-purple-50',
  }
  const phaseHeaderColors: Record<string, string> = {
    P: 'bg-blue-600',
    D: 'bg-green-600',
    C: 'bg-yellow-600',
    A: 'bg-purple-600',
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>🔄</span> วิธีดำเนินการโครงการ (PDCA)</h2>
      <div className="space-y-6">
        {PDCA_PHASES.map(({ phase, label }) => (
          <div key={phase} className={`border rounded-xl overflow-hidden ${phaseColors[phase]}`}>
            <div className={`${phaseHeaderColors[phase]} text-white px-4 py-3 flex items-center justify-between`}>
              <h3 className="font-semibold text-sm">{label}</h3>
              <button type="button" onClick={() => addItem(phase)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
                + เพิ่มกิจกรรม
              </button>
            </div>
            <div className="p-4">
              {(items[phase] || []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">ยังไม่มีกิจกรรม กดปุ่ม "+ เพิ่มกิจกรรม" เพื่อเริ่ม</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b">
                      <th className="text-left pb-2 pr-2">กิจกรรมที่จัด</th>
                      <th className="text-left pb-2 pr-2 w-28">วันที่เริ่ม</th>
                      <th className="text-left pb-2 pr-2 w-28">วันที่สิ้นสุด</th>
                      <th className="text-left pb-2 pr-2">ผู้รับผิดชอบ</th>
                      <th className="pb-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {(items[phase] || []).map(item => (
                      <tr key={item.id} className="border-b border-white/50 last:border-0">
                        <td className="py-1.5 pr-2">
                          <input value={item.activity} onChange={e => updateItem(phase, item.id, 'activity', e.target.value)} className="w-full px-2 py-1.5 border border-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-white" placeholder="ชื่อกิจกรรม" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input type="date" value={item.startDate} onChange={e => updateItem(phase, item.id, 'startDate', e.target.value)} className="w-full px-2 py-1.5 border border-white rounded text-xs focus:outline-none focus:ring-1" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input type="date" value={item.endDate} onChange={e => updateItem(phase, item.id, 'endDate', e.target.value)} className="w-full px-2 py-1.5 border border-white rounded text-xs focus:outline-none focus:ring-1" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <input value={item.responsible} onChange={e => updateItem(phase, item.id, 'responsible', e.target.value)} className="w-full px-2 py-1.5 border border-white rounded text-xs focus:outline-none focus:ring-1" placeholder="ผู้รับผิดชอบ" />
                        </td>
                        <td className="py-1.5">
                          <button type="button" onClick={() => removeItem(phase, item.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
