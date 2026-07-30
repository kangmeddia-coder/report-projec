'use client'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function Step3Budget({ formData, onComplete }: any) {
  const [data, setData] = useState({
    budgetType: formData.budgetType || '',
    approved: formData.approved || 0,
    used: formData.used || 0,
  })
  const remaining = data.approved - data.used
  const percent = data.approved > 0 ? Math.round((data.used / data.approved) * 100) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (data.used > data.approved) {
      alert('งบประมาณที่ใช้ไปมากกว่างบที่ได้รับอนุมัติ')
      return
    }
    onComplete({ ...data, remaining })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>💰</span> งบประมาณ</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-500 mb-1">งบประมาณที่ได้รับอนุมัติ</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(data.approved)}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-500 mb-1">งบประมาณที่ใช้ไป</p>
          <p className="text-xl font-bold text-orange-700">{formatCurrency(data.used)}</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${remaining < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-xs mb-1 ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>งบประมาณคงเหลือ</p>
          <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{formatCurrency(remaining)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>สัดส่วนการใช้งบประมาณ</span>
          <span className={percent > 100 ? 'text-red-600 font-bold' : ''}>{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${percent > 100 ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
        {data.used > data.approved && <p className="text-xs text-red-500 mt-1">⚠️ งบที่ใช้ไปเกินงบที่ได้รับอนุมัติ</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทเงินที่ได้รับจัดสรร</label>
          <input value={data.budgetType} onChange={e => setData({...data, budgetType: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น งบอุดหนุน, งบดำเนินงาน" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณที่ได้รับอนุมัติ (บาท)</label>
          <input type="number" min="0" value={data.approved} onChange={e => setData({...data, approved: Number(e.target.value)})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณที่ใช้ไป (บาท)</label>
          <input type="number" min="0" max={data.approved} value={data.used} onChange={e => setData({...data, used: Number(e.target.value)})} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${data.used > data.approved ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณคงเหลือ (คำนวณอัตโนมัติ)</label>
          <input readOnly value={remaining} className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-500" />
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
