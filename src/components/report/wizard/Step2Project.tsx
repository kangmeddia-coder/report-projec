'use client'
import { useState } from 'react'

export default function Step2Project({ formData, onComplete }: any) {
  const [data, setData] = useState({
    strategyItem: formData.strategyItem || '',
    strategyDetail: formData.strategyDetail || '',
    missionItem: formData.missionItem || '',
    missionDetail: formData.missionDetail || '',
    standardRef: formData.standardRef || '',
    standardConsideration: formData.standardConsideration || '',
    standardItem: formData.standardItem || '',
    implementationStatus: formData.implementationStatus || 'COMPLETED',
    cancellationReason: formData.cancellationReason || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(data)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>🏫</span> ข้อมูลโครงการ</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">สนองกลยุทธ์ของโรงเรียน ข้อที่</label>
            <input value={data.strategyItem} onChange={e => setData({...data, strategyItem: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น 1, 2, 3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดกลยุทธ์</label>
            <input value={data.strategyDetail} onChange={e => setData({...data, strategyDetail: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">สนองพันธกิจของโรงเรียน ข้อที่</label>
            <input value={data.missionItem} onChange={e => setData({...data, missionItem: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดพันธกิจ</label>
            <input value={data.missionDetail} onChange={e => setData({...data, missionDetail: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">สนองมาตรฐานการศึกษา</label>
            <input value={data.standardRef} onChange={e => setData({...data, standardRef: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเด็นพิจารณา ข้อที่</label>
            <input value={data.standardItem} onChange={e => setData({...data, standardItem: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">สถานะการดำเนินงาน</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="COMPLETED" checked={data.implementationStatus === 'COMPLETED'} onChange={e => setData({...data, implementationStatus: e.target.value})} className="text-blue-600" />
              <span className="text-sm text-slate-700">✅ ดำเนินการเสร็จแล้ว</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="NOT_IMPLEMENTED" checked={data.implementationStatus === 'NOT_IMPLEMENTED'} onChange={e => setData({...data, implementationStatus: e.target.value})} className="text-blue-600" />
              <span className="text-sm text-slate-700">❌ ไม่ได้ดำเนินการ</span>
            </label>
          </div>
          {data.implementationStatus === 'NOT_IMPLEMENTED' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-red-600 mb-1">เหตุผลที่ไม่ได้ดำเนินการ</label>
              <textarea value={data.cancellationReason} onChange={e => setData({...data, cancellationReason: e.target.value})} className="w-full px-3 py-2.5 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]" placeholder="ระบุเหตุผล..." />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
