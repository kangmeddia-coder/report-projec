'use client'
import { useState } from 'react'
import { EVIDENCE_TYPES } from '@/types'

interface ActivityPhoto {
  id: string
  url: string
  caption: string
}

const SAMPLE_IMAGES = [
  { label: 'ภาพการอบรม/ประชุม', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80' },
  { label: 'ภาพกิจกรรมนักเรียน', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80' },
  { label: 'ภาพการมอบเกียรติบัตร', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80' },
]

export default function Step8Evidence({ formData, onComplete }: any) {
  const [docs, setDocs] = useState<Record<string, boolean>>(formData.evidenceDocs || {})
  const [photos, setPhotos] = useState<ActivityPhoto[]>(
    formData.activityPhotos && formData.activityPhotos.length > 0
      ? formData.activityPhotos
      : [
          { id: '1', url: SAMPLE_IMAGES[0].url, caption: 'ภาพที่ 1: การดำเนินกิจกรรมตามโครงการ' },
          { id: '2', url: SAMPLE_IMAGES[1].url, caption: 'ภาพที่ 2: ครูและบุคลากรเข้าร่วมกิจกรรม' },
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
    let cleanVal = value
    if (field === 'url' && value.trim()) {
      if (!value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('data:')) {
        cleanVal = 'https://' + value.trim()
      }
    }
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: cleanVal } : p))
  }

  const handleFileUpload = (id: string, file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        updatePhoto(id, 'url', dataUrl)
      }
    }
    reader.readAsDataURL(file)
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

      {/* 2. Photo Attachment Section (File Upload OR Image URL) */}
      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">2. แนบรูปภาพประกอบกิจกรรม (แสดงในเล่มรายงาน)</h3>
            <p className="text-xs text-slate-400 mt-0.5">เลือกไฟล์ภาพจากเครื่อง หรือ วาง URL ลิงก์รูปภาพ (เช่น https://...)</p>
          </div>
          <button
            type="button"
            onClick={addPhoto}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-3.5 py-2 rounded-xl border border-blue-200 transition-all shadow-sm"
          >
            + เพิ่มรูปภาพ
          </button>
        </div>

        {/* Preset Sample Images Quick Buttons */}
        <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-blue-800">💡 เลือกภาพตัวอย่างลองใช้:</span>
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                setPhotos(prev => [
                  ...prev,
                  { id: Date.now().toString(), url: sample.url, caption: sample.label }
                ])
              }}
              className="bg-white text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + {sample.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  ภาพประกอบที่ {index + 1}
                </span>
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
                  >
                    ลบภาพนี้
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: File Upload */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    📁 เลือกไฟล์ภาพจากคอมพิวเตอร์ / มือถือ
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(photo.id, e.target.files[0])
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">รองรับไฟล์ .JPG, .PNG, .WEBP</p>
                </div>

                {/* Method B: Direct URL */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    🔗 หรือ วาง URL ลิงก์รูปภาพ
                  </label>
                  <input
                    type="text"
                    value={photo.url}
                    onChange={(e) => updatePhoto(photo.id, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">ตัวอย่าง: https://domain.com/image.jpg</p>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายภาพใต้รูป</label>
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updatePhoto(photo.id, 'caption', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="คำอธิบายภาพกิจกรรม..."
                />
              </div>

              {/* Live Preview */}
              {photo.url.trim() ? (
                <div className="mt-3 text-center bg-white p-3 border border-slate-200 rounded-xl max-w-sm mx-auto shadow-sm">
                  <div className="overflow-hidden rounded-lg max-h-48 bg-slate-100 flex items-center justify-center">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      className="max-h-48 w-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80'
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-2">{photo.caption}</p>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  📷 ยังไม่ได้แนบรูปภาพสำหรับภาพประกอบที่ {index + 1}
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
