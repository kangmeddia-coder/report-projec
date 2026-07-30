'use client'
import { useState } from 'react'

export default function Step7Summary({ formData, onComplete }: any) {
  const [data, setData] = useState({
    strengths: formData.strengths || '',
    improvements: formData.improvements || '',
    suggestions: formData.suggestions || '',
  })

  return (
    <form onSubmit={e => { e.preventDefault(); onComplete(data) }} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>📝</span> สรุปภาพรวม</h2>
      <div className="space-y-4">
        {[
          { field: 'strengths', label: '✅ จุดเด่นของโครงการ/กิจกรรม', placeholder: 'ระบุจุดเด่นและข้อดีของโครงการ...' },
          { field: 'improvements', label: '🔧 จุดที่ควรพัฒนา', placeholder: 'ระบุจุดที่ควรปรับปรุงหรือพัฒนา...' },
          { field: 'suggestions', label: '💡 ข้อเสนอแนะเพื่อพัฒนาโครงการ', placeholder: 'ข้อเสนอแนะสำหรับการดำเนินงานครั้งต่อไป...' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <textarea value={(data as any)[field]} onChange={e => setData({ ...data, [field]: e.target.value })} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y" placeholder={placeholder} />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
