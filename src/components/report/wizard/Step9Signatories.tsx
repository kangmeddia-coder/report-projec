'use client'
import { useState } from 'react'

const SIGNATORY_ROLES = [
  { role: 'REPORTER', label: 'ผู้รายงาน', icon: '👤' },
  { role: 'PLAN_HEAD', label: 'หัวหน้างานนโยบายและแผน', icon: '👔' },
  { role: 'PRINCIPAL', label: 'ผู้อำนวยการโรงเรียน', icon: '🏆' },
]

export default function Step9Signatories({ formData, onComplete }: any) {
  const [sigs, setSigs] = useState<Record<string, any>>(formData.signatories || {
    REPORTER: {}, PLAN_HEAD: {}, PRINCIPAL: {}
  })

  const update = (role: string, field: string, val: string) =>
    setSigs(p => ({ ...p, [role]: { ...p[role], [field]: val } }))

  return (
    <form onSubmit={e => { e.preventDefault(); onComplete({ signatories: sigs }) }} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>✍️</span> ผู้ลงนาม</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SIGNATORY_ROLES.map(({ role, label, icon }) => (
          <div key={role} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">{icon} {label}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">ชื่อ-นามสกุล</label>
                <input value={sigs[role]?.name || ''} onChange={e => update(role, 'name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">ตำแหน่ง</label>
                <input value={sigs[role]?.position || ''} onChange={e => update(role, 'position', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {role === 'REPORTER' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">วิทยฐานะ</label>
                  <input value={sigs[role]?.academicStanding || ''} onChange={e => update(role, 'academicStanding', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">✅ บันทึกรายงานเสร็จสิ้น</button>
      </div>
    </form>
  )
}
