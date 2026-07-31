'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface WorkflowBarProps {
  reportId: string
  status: string
  userRole: string
  comments: any[]
}

export default function WorkflowBar({ reportId, status, userRole, comments }: WorkflowBarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string, requireComment = false) => {
    if (requireComment && !commentText.trim()) {
      setPendingStatus(newStatus)
      setShowCommentBox(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment: commentText.trim() || undefined }),
      })
      if (res.ok) {
        toast.success('บันทึกการเปลี่ยนสถานะเรียบร้อยแล้ว!')
        setCommentText('')
        setShowCommentBox(false)
        setPendingStatus(null)
        router.refresh()
      } else {
        toast.error('ไม่สามารถเปลี่ยนสถานะได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="no-print bg-slate-900 text-white p-4 rounded-2xl mb-6 shadow-xl border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">การพิจารณาและตรวจสอบรายงาน</p>
          <p className="text-sm font-semibold flex items-center gap-2 mt-0.5">
            <span>สถานะปัจจุบัน:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {status}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {(status === 'IN_PROGRESS' || status === 'DRAFT' || status === 'NEEDS_REVISION') && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange('SUBMITTED')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
            >
              📩 ส่งรายงานเพื่อตรวจสอบ
            </button>
          )}

          {(userRole === 'ADMIN' || userRole === 'REVIEWER') && status === 'SUBMITTED' && (
            <>
              <button
                disabled={loading}
                onClick={() => handleStatusChange('APPROVED')}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
              >
                ✅ อนุมัติรายงาน
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setShowCommentBox(true)
                  setPendingStatus('NEEDS_REVISION')
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
              >
                ✏️ ส่งกลับแก้ไข
              </button>
            </>
          )}

          {(userRole === 'ADMIN' || userRole === 'REVIEWER') && status === 'APPROVED' && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange('COMPLETED')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
            >
              🏆 เสร็จสมบูรณ์ (เสร็จสิ้นโครงการ)
            </button>
          )}
        </div>
      </div>

      {/* Comment Box Modal / Expandable */}
      {showCommentBox && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <label className="block text-xs text-slate-300 font-medium mb-1.5">
            ความคิดเห็น / ข้อเสนอแนะการแก้ไข
          </label>
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="พิมพ์ความคิดเห็นหรือสิ่งที่ต้องแก้ไข..."
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowCommentBox(false)
                setPendingStatus(null)
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStatusChange(pendingStatus || 'NEEDS_REVISION', true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              ยืนยันการส่งความคิดเห็น
            </button>
          </div>
        </div>
      )}

      {/* Comment History */}
      {comments && comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-400">💬 ประวัติความคิดเห็นและการตรวจสอบ:</p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {comments.map((c: any) => (
              <div key={c.id} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50 text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-semibold text-blue-300">{c.authorName || 'ผู้ตรวจสอบ'}</span>
                  <span className="text-[10px]">{new Date(c.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <p className="text-slate-200">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
