'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getStatusLabel, getStatusColor } from '@/lib/utils'
import { WORK_GROUPS, FISCAL_YEARS } from '@/types'

interface Report {
  id: string
  title: string
  activityName: string
  fiscalYear: string
  workGroup: string | null
  status: string
  completeness: number
  author: { name: string }
  updatedAt: string
  budget: { approved: number; used: number } | null
}

export default function ReportsClient({ reports: initialReports, userRole }: { reports: Report[], userRole: string }) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)
  const [search, setSearch] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.title.includes(search) || r.activityName.includes(search) || r.author.name.includes(search)
    const matchYear = !filterYear || r.fiscalYear === filterYear
    const matchGroup = !filterGroup || r.workGroup === filterGroup
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchYear && matchGroup && matchStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรายงานนี้ใช่หรือไม่?')) return
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('ลบรายงานเรียบร้อย')
      setReports(reports.filter(r => r.id !== id))
      router.refresh()
    } else {
      toast.error('ไม่สามารถลบได้')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string, statusName: string) => {
    const comment = newStatus === 'NEEDS_REVISION'
      ? prompt('ระบุข้อเสนอแนะที่ต้องการให้แก้ไข:')
      : undefined

    if (newStatus === 'NEEDS_REVISION' && comment === null) return

    setUpdatingId(id)
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment }),
      })
      if (res.ok) {
        toast.success(`เปลี่ยนสถานะเป็น "${statusName}" เรียบร้อยแล้ว`)
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r))
        router.refresh()
      } else {
        toast.error('เปลี่ยนสถานะไม่สำเร็จ')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานโครงการ/กิจกรรม</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการ ตรวจสอบ และติดตามรายงานทั้งหมด</p>
        </div>
        <Link href="/reports/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          สร้างรายงานใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อโครงการ/กิจกรรม..." className="col-span-2 lg:col-span-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">ทุกปีงบประมาณ</option>
            {FISCAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">ทุกสถานะ</option>
            <option value="DRAFT">แบบร่าง</option>
            <option value="IN_PROGRESS">กำลังจัดทำ</option>
            <option value="SUBMITTED">ส่งตรวจสอบ</option>
            <option value="NEEDS_REVISION">ต้องแก้ไข</option>
            <option value="APPROVED">อนุมัติ</option>
            <option value="COMPLETED">เสร็จสมบูรณ์</option>
          </select>
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">ทุกกลุ่มงาน</option>
            {WORK_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 text-sm text-slate-500">
          พบ {filtered.length} รายการ
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-slate-500">ไม่พบรายการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">ชื่อโครงการ/กิจกรรม</th>
                  <th className="px-4 py-3 text-left">ปีงบประมาณ</th>
                  <th className="px-4 py-3 text-left">ผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 text-left">กลุ่มงาน</th>
                  <th className="px-4 py-3 text-left">ความสมบูรณ์</th>
                  <th className="px-4 py-3 text-left">สถานะ</th>
                  <th className="px-4 py-3 text-left">จัดการ & ขั้นตอน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1">{r.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.activityName}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium">{r.fiscalYear}</td>
                    <td className="px-4 py-4 text-slate-600">{r.author.name}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs">{r.workGroup || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${r.completeness}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{r.completeness}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <Link href={`/reports/${r.id}`} className="text-blue-600 font-medium hover:underline">แก้ไข</Link>
                        <Link href={`/reports/${r.id}/preview`} className="text-slate-600 hover:underline">ดูตัวอย่าง</Link>
                        
                        {/* Workflow Buttons */}
                        {(r.status === 'IN_PROGRESS' || r.status === 'DRAFT' || r.status === 'NEEDS_REVISION') && (
                          <button
                            disabled={updatingId === r.id}
                            onClick={() => handleStatusChange(r.id, 'SUBMITTED', 'ส่งตรวจสอบ')}
                            className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded font-medium"
                          >
                            📩 ส่งตรวจ
                          </button>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'REVIEWER') && r.status === 'SUBMITTED' && (
                          <>
                            <button
                              disabled={updatingId === r.id}
                              onClick={() => handleStatusChange(r.id, 'APPROVED', 'อนุมัติแล้ว')}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-medium"
                            >
                              ✅ อนุมัติ
                            </button>
                            <button
                              disabled={updatingId === r.id}
                              onClick={() => handleStatusChange(r.id, 'NEEDS_REVISION', 'ต้องแก้ไข')}
                              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded font-medium"
                            >
                              ✏️ ส่งแก้
                            </button>
                          </>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'REVIEWER') && r.status === 'APPROVED' && (
                          <button
                            disabled={updatingId === r.id}
                            onClick={() => handleStatusChange(r.id, 'COMPLETED', 'เสร็จสมบูรณ์')}
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded font-medium"
                          >
                            🏆 ปิดงาน
                          </button>
                        )}

                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 hover:underline ml-1">ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
