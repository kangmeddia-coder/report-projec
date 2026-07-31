'use client'
import { useState } from 'react'
import { EVIDENCE_TYPES } from '@/types'

interface ActivityPhoto {
  id: string
  url: string
  caption: string
}

export default function Step8Evidence({ formData, onComplete }: any) {
  const [docs, setDocs] = useState<Record<string, boolean>>(formData.evidenceDocs || {})
  const [photos, setPhotos] = useState<ActivityPhoto[]>(
    formData.activityPhotos || [
      { id: '1', url: '', caption: 'ภาพที่ 1: การดำเนินกิจกรรม' },
      { id: '2', url: '', caption: 'ภาพที่ 2: ผู้เข้าร่วมกิจกรรม' },
    ]
  )

  const toggle = (key: string, val: boolean) => setDocs(p => ({ ...p, [key]: val }))

  const addPhoto = () => {
    setPhotos(prev => [
      ...prev,
      { id: Date.now().toString(), url: '', caption: `ภาพที่ ${prev.length + 1}: ` }
    ])
  }

  const updatePhoto = (id: string, field: 'url' | 'caption', value: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validPhotos = photos.filter(p => p.url.trim() !== '')
    onComplete({ evidenceDocs: docs, activityPhotos: validPhotos })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
        <span>📁</span> เอกสารหลักฐานและภาพประกอบกิจกรรม
      </h2>

      {/* 1. Evidence Document Checklist */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">1. ตรวจสอบเอกสารหลักฐานที่มี</h3>
        <div className="space-y-2.5">
          {EVIDENCE_TYPES.map(({ key, label }) => (
            <div
              key={key}
              className={`border rounded-xl p-3.5 transition-all ${
                docs[key] ? 'border-green-200 bg-green-50/60' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={key}
                      checked={docs[key] === true}
                      onChange={() => toggle(key, true)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs font-semibold text-green-700">มี</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name={key}
                      checked={docs[key] === false}
                      onChange={() => toggle(key, false)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold text-red-600">ไม่มี</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Image URL Attachment for Report Document */}
      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">2. ลิงก์รูปภาพประกอบกิจกรรม (นำมาแสดงในรายงาน)</h3>
            <p className="text-xs text-slate-400 mt-0.5">วาง URL ลิงก์รูปภาพ (เช่น https://...png/jpg) เพื่อนำไปแสดงในหน้ารายงานผล</p>
          </div>
          <button
            type="button"
            onClick={addPhoto}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            + เพิ่มลิงก์ภาพ
          </button>
        </div>

        <div className="space-y-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">ภาพที่ {index + 1}</span>
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">URL ลิงก์ไฟล์รูปภาพ <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    value={photo.url}
                    onChange={(e) => updatePhoto(photo.id, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">คำอธิบายภาพ</label>
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => updatePhoto(photo.id, 'caption', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="คำอธิบายภาพกิจกรรม..."
                  />
                </div>
              </div>
              {photo.url.trim() && (
                <div className="mt-2 text-center bg-white p-2 border border-slate-200 rounded-lg max-w-xs mx-auto">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="max-h-36 mx-auto object-contain rounded"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-100"
        >
          บันทึกและถัดไป →
        </button>
      </div>
    </form>
  )
}
