'use client'
import { useState } from 'react'
import { WORK_GROUPS, FISCAL_YEARS } from '@/types'

export default function Step1Basic({ formData, onComplete }: any) {
  const [data, setData] = useState({
    title: formData.title || '',
    activityName: formData.activityName || '',
    fiscalYear: formData.fiscalYear || '2568',
    workGroup: formData.workGroup || '',
    responsiblePerson: formData.responsiblePerson || '',
    position: formData.position || '',
    schoolName: formData.schoolName || '',
    district: formData.district || '',
    affiliation: formData.affiliation || '',
    ministry: formData.ministry || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(data)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>📋</span> ข้อมูลพื้นฐาน</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อโครงการ <span className="text-red-500">*</span></label>
          <input required value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="กรอกชื่อโครงการ" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
          <input required value={data.activityName} onChange={e => setData({...data, activityName: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="กรอกชื่อกิจกรรม" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ พ.ศ. <span className="text-red-500">*</span></label>
          <select required value={data.fiscalYear} onChange={e => setData({...data, fiscalYear: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {FISCAL_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">กลุ่มงาน/กลุ่มสาระฯ <span className="text-red-500">*</span></label>
          <select required value={data.workGroup} onChange={e => setData({...data, workGroup: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- เลือกกลุ่มงาน --</option>
            {WORK_GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ผู้รับผิดชอบโครงการ <span className="text-red-500">*</span></label>
          <input required value={data.responsiblePerson} onChange={e => setData({...data, responsiblePerson: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ชื่อ-นามสกุล" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่ง</label>
          <input value={data.position} onChange={e => setData({...data, position: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น ครู ชำนาญการ" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">โรงเรียน</label>
          <input value={data.schoolName} onChange={e => setData({...data, schoolName: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">สำนักงานเขตพื้นที่การศึกษา</label>
          <input value={data.district} onChange={e => setData({...data, district: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยงานต้นสังกัด</label>
          <input value={data.affiliation} onChange={e => setData({...data, affiliation: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">กระทรวง</label>
          <input value={data.ministry} onChange={e => setData({...data, ministry: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="กระทรวงศึกษาธิการ" />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
