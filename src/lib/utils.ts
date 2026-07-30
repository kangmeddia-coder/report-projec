import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount) + ' บาท'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'แบบร่าง',
    IN_PROGRESS: 'กำลังจัดทำ',
    SUBMITTED: 'ส่งตรวจสอบ',
    NEEDS_REVISION: 'ต้องแก้ไข',
    APPROVED: 'อนุมัติ',
    COMPLETED: 'เสร็จสมบูรณ์',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
    SUBMITTED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    NEEDS_REVISION: 'bg-red-100 text-red-700 border-red-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getQualityLevel(percent: number): string {
  if (percent >= 80) return 'ยอดเยี่ยม'
  if (percent >= 70) return 'ดีเลิศ'
  if (percent >= 60) return 'ดี'
  if (percent >= 50) return 'ปานกลาง'
  return 'ปรับปรุง'
}

export function getQualityLevelColor(percent: number): string {
  if (percent >= 80) return 'bg-emerald-100 text-emerald-700'
  if (percent >= 70) return 'bg-green-100 text-green-700'
  if (percent >= 60) return 'bg-blue-100 text-blue-700'
  if (percent >= 50) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function getSatisfactionLevel(avg: number): string {
  if (avg >= 4.5) return 'มากที่สุด'
  if (avg >= 3.5) return 'มาก'
  if (avg >= 2.5) return 'ปานกลาง'
  if (avg >= 1.5) return 'น้อย'
  return 'น้อยที่สุด'
}

export function calculateCompleteness(report: any): number {
  let score = 0
  const total = 9
  if (report.title && report.activityName && report.fiscalYear) score++
  if (report.project) score++
  if (report.budget?.approved > 0) score++
  if (report.pdcaItems?.length > 0) score++
  if (report.objectives?.length > 0) score++
  if (report.achievementScore) score++
  if (report.reportSummary?.strengths) score++
  if (report.evidenceDocs?.some((d: any) => d.hasDoc)) score++
  if (report.signatories?.length > 0) score++
  return Math.round((score / total) * 100)
}

export function generatePreface(report: any): string {
  return `รายงานผลการดำเนินงานโครงการ/กิจกรรม ฉบับนี้จัดทำขึ้นเพื่อรายงานผลการดำเนินงานโครงการ${report.title || '[ชื่อโครงการ]'} กิจกรรม${report.activityName || '[ชื่อกิจกรรม]'} ปีงบประมาณ พ.ศ. ${report.fiscalYear || '[ปี]'} โดยมีวัตถุประสงค์เพื่อพัฒนาคุณภาพการศึกษาและยกระดับมาตรฐานการเรียนรู้ของนักเรียนและบุคลากร

รายงานฉบับนี้ได้รวบรวมข้อมูล สรุปผลการดำเนินงาน ผลสัมฤทธิ์ และข้อเสนอแนะเพื่อการพัฒนาต่อเนื่อง หวังเป็นอย่างยิ่งว่ารายงานฉบับนี้จะเป็นประโยชน์ต่อการพัฒนาคุณภาพการศึกษาและเป็นแนวทางในการดำเนินงานโครงการ/กิจกรรมในปีการศึกษาต่อไป

ขอขอบคุณทุกท่านที่มีส่วนร่วมในการดำเนินโครงการ/กิจกรรมครั้งนี้ให้สำเร็จลุล่วงด้วยดี`
}
