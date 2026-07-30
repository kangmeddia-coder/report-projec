'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Step1Basic from '@/components/report/wizard/Step1Basic'
import Step2Project from '@/components/report/wizard/Step2Project'
import Step3Budget from '@/components/report/wizard/Step3Budget'
import Step4Pdca from '@/components/report/wizard/Step4Pdca'
import Step5Objectives from '@/components/report/wizard/Step5Objectives'
import Step6Success from '@/components/report/wizard/Step6Success'
import Step7Summary from '@/components/report/wizard/Step7Summary'
import Step8Evidence from '@/components/report/wizard/Step8Evidence'
import Step9Signatories from '@/components/report/wizard/Step9Signatories'

const STEPS = [
  { id: 1, label: 'ข้อมูลพื้นฐาน', icon: '📋' },
  { id: 2, label: 'ข้อมูลโครงการ', icon: '🏫' },
  { id: 3, label: 'งบประมาณ', icon: '💰' },
  { id: 4, label: 'วิธีดำเนินการ', icon: '🔄' },
  { id: 5, label: 'สรุปผล', icon: '🎯' },
  { id: 6, label: 'ความสำเร็จ', icon: '⭐' },
  { id: 7, label: 'สรุปภาพรวม', icon: '📝' },
  { id: 8, label: 'หลักฐาน', icon: '📁' },
  { id: 9, label: 'ผู้ลงนาม', icon: '✍️' },
]

export default function NewReportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [reportId, setReportId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    title: '', activityName: '', fiscalYear: '2568', workGroup: '',
    responsiblePerson: '', position: '', schoolName: '', district: '',
    affiliation: '', ministry: '',
    strategyItem: '', strategyDetail: '', missionItem: '', missionDetail: '',
    standardRef: '', standardConsideration: '', standardItem: '',
    implementationStatus: 'COMPLETED', cancellationReason: '',
    budgetType: '', approved: 0, used: 0,
    pdcaItems: { P: [], D: [], C: [], A: [] },
    objectives: [],
    qualityPercent: 0, quantityTarget: 0, quantityActual: 0,
    satisfactionScores: {},
    strengths: '', improvements: '', suggestions: '',
    evidenceDocs: {},
    signatories: { REPORTER: {}, PLAN_HEAD: {}, PRINCIPAL: {} },
  })

  const completeness = Math.round((currentStep / 9) * 100)

  // Autosave every 30 seconds
  useEffect(() => {
    if (!reportId) return
    const timer = setInterval(async () => {
      await saveProgress()
    }, 30000)
    return () => clearInterval(timer)
  }, [reportId, formData])

  const saveProgress = useCallback(async () => {
    if (!reportId) return
    setSaving(true)
    try {
      await fetch(`/api/reports/${reportId}/autosave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      })
      setLastSaved(new Date())
    } catch (e) { /* silent */ } finally {
      setSaving(false)
    }
  }, [reportId, formData])

  const handleStepComplete = async (stepData: Record<string, any>) => {
    const updated = { ...formData, ...stepData }
    setFormData(updated)

    setSaving(true)
    try {
      if (!reportId) {
        // สร้าง report ใหม่
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updated, status: 'IN_PROGRESS', completeness }),
        })
        const data = await res.json()
        if (data.id) {
          setReportId(data.id)
          setLastSaved(new Date())
          toast.success('บันทึกข้อมูลแล้ว')
        }
      } else {
        await fetch(`/api/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updated, completeness }),
        })
        setLastSaved(new Date())
        toast.success('บันทึกข้อมูลแล้ว')
      }
    } catch (e) {
      toast.error('บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }

    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.success('🎉 บันทึกรายงานเสร็จสมบูรณ์!')
      router.push(reportId ? `/reports/${reportId}/preview` : '/reports')
    }
  }

  const handleSaveDraft = async () => {
    toast.info('บันทึกแบบร่าง...')
    if (reportId) await saveProgress()
    router.push('/reports')
  }

  const stepProps = { formData, onComplete: handleStepComplete }

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1Basic {...stepProps} />,
    2: <Step2Project {...stepProps} />,
    3: <Step3Budget {...stepProps} />,
    4: <Step4Pdca {...stepProps} />,
    5: <Step5Objectives {...stepProps} />,
    6: <Step6Success {...stepProps} />,
    7: <Step7Summary {...stepProps} />,
    8: <Step8Evidence {...stepProps} />,
    9: <Step9Signatories {...stepProps} />,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">สร้างรายงานโครงการใหม่</h1>
          {lastSaved && (
            <p className="text-xs text-slate-400 mt-1">
              {saving ? '⏳ กำลังบันทึก...' : `✅ บันทึกล่าสุด ${lastSaved.toLocaleTimeString('th-TH')}`}
            </p>
          )}
        </div>
        <button onClick={handleSaveDraft} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          💾 บันทึกแบบร่าง
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">ความสมบูรณ์: {completeness}%</span>
          <span className="text-sm text-slate-400">ขั้นที่ {currentStep} / {STEPS.length}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
          <div className="h-2 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`flex flex-col items-center min-w-[70px] ${
                  step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step.id < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step.id < currentStep ? '✓' : step.icon}
                </div>
                <span className={`text-xs mt-1 text-center leading-tight ${
                  step.id === currentStep ? 'text-blue-600 font-semibold' :
                  step.id < currentStep ? 'text-emerald-600' : 'text-slate-400'
                }`}>{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-6 mx-0.5 ${
                  step.id < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {stepComponents[currentStep]}
      </div>

      {/* Navigation */}
      {currentStep > 1 && (
        <div className="mt-4 flex justify-start">
          <button
            onClick={() => setCurrentStep(p => p - 1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
          >
            ← ย้อนกลับ
          </button>
        </div>
      )}
    </div>
  )
}
