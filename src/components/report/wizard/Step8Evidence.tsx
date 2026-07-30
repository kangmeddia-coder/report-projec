'use client'
import { useState } from 'react'
import { EVIDENCE_TYPES } from '@/types'

export default function Step8Evidence({ formData, onComplete }: any) {
  const [docs, setDocs] = useState<Record<string, boolean>>(formData.evidenceDocs || {})

  const toggle = (key: string, val: boolean) => setDocs(p => ({ ...p, [key]: val }))

  return (
    <form onSubmit={e => { e.preventDefault(); onComplete({ evidenceDocs: docs }) }} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2"><span>📁</span> เอกสารหลักฐาน</h2>
      <div className="space-y-3">
        {EVIDENCE_TYPES.map(({ key, label }) => (
          <div key={key} className={`border rounded-xl p-4 transition-all ${
            docs[key] ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name={key} checked={docs[key] === true} onChange={() => toggle(key, true)} className="text-green-600" />
                  <span className="text-sm text-green-700">มี</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name={key} checked={docs[key] === false} onChange={() => toggle(key, false)} className="text-red-600" />
                  <span className="text-sm text-red-600">ไม่มี</span>
                </label>
              </div>
            </div>
            {docs[key] === true && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600 mb-2">📎 Upload ไฟล์ (PDF, DOC, JPG, PNG)</p>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-green-600 file:text-white hover:file:bg-green-700" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold">บันทึกและถัดไป →</button>
      </div>
    </form>
  )
}
