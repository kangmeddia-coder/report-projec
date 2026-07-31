'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  school: any
  user: any
}

export default function SettingsForm({ school: initialSchool, user }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [schoolData, setSchoolData] = useState({
    name: initialSchool?.name || '',
    address: initialSchool?.address || '',
    district: initialSchool?.district || '',
    affiliation: initialSchool?.affiliation || '',
    ministry: initialSchool?.ministry || '',
    principalName: initialSchool?.principalName || '',
    planHeadName: initialSchool?.planHeadName || '',
    fontFamily: initialSchool?.fontFamily || 'Sarabun',
    paperSize: initialSchool?.paperSize || 'A4',
    docNumberFormat: initialSchool?.docNumberFormat || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
      })
      if (res.ok) {
        toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว!')
        router.refresh()
      } else {
        toast.error('ไม่สามารถบันทึกการตั้งค่าได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* School Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>🏫</span> ข้อมูลโรงเรียน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 font-medium mb-1">ชื่อโรงเรียน</label>
            <input
              type="text"
              value={schoolData.name}
              onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="โรงเรียน..."
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">ที่อยู่</label>
            <input
              type="text"
              value={schoolData.address}
              onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">สำนักงานเขตพื้นที่การศึกษา</label>
            <input
              type="text"
              value={schoolData.district}
              onChange={(e) => setSchoolData({ ...schoolData, district: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">สังกัด</label>
            <input
              type="text"
              value={schoolData.affiliation}
              onChange={(e) => setSchoolData({ ...schoolData, affiliation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">กระทรวง</label>
            <input
              type="text"
              value={schoolData.ministry}
              onChange={(e) => setSchoolData({ ...schoolData, ministry: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Executives & Signatories */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>✍️</span> ผู้บริหารและหัวหน้างาน (สำหรับใบอนุมัติ)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">ชื่อ-นามสกุล ผู้อำนวยการ</label>
            <input
              type="text"
              value={schoolData.principalName}
              onChange={(e) => setSchoolData({ ...schoolData, principalName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="นาย/นาง..."
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">ชื่อ-นามสกุล หัวหน้างานแผนฯ</label>
            <input
              type="text"
              value={schoolData.planHeadName}
              onChange={(e) => setSchoolData({ ...schoolData, planHeadName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="นาย/นาง..."
            />
          </div>
        </div>
      </div>

      {/* Document Formatting Options */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>📄</span> รูปแบบเอกสารรายงาน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">ฟอนต์เอกสาร</label>
            <select
              value={schoolData.fontFamily}
              onChange={(e) => setSchoolData({ ...schoolData, fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Sarabun">TH Sarabun PSK / Sarabun</option>
              <option value="Prompt">Prompt</option>
              <option value="Kanit">Kanit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">ขนาดกระดาษ</label>
            <select
              value={schoolData.paperSize}
              onChange={(e) => setSchoolData({ ...schoolData, paperSize: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="Letter">Letter</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Info Read-only */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>👤</span> ข้อมูลผู้ใช้งานในระบบ
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">ชื่อ-นามสกุล</p>
            <p className="font-medium text-slate-800">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">อีเมล</p>
            <p className="font-medium text-slate-800">{user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">บทบาท</p>
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {{ ADMIN: 'ผู้ดูแลระบบ', TEACHER: 'ครู/บุคลากร', REVIEWER: 'ผู้ตรวจสอบ' }[user?.role as string] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all text-sm disabled:opacity-50"
        >
          {loading ? '⏳ กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
        </button>
      </div>
    </form>
  )
}
