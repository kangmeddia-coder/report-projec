export type UserRole = 'ADMIN' | 'TEACHER' | 'REVIEWER'

export type ReportStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'COMPLETED'

export type PdcaPhase = 'P' | 'D' | 'C' | 'A'

export interface ReportListItem {
  id: string
  title: string
  activityName: string
  fiscalYear: string
  workGroup: string | null
  status: ReportStatus
  completeness: number
  author: { name: string }
  updatedAt: Date
  createdAt: Date
}

export interface DashboardStats {
  total: number
  draft: number
  inProgress: number
  submitted: number
  approved: number
  completed: number
  totalBudgetApproved: number
  totalBudgetUsed: number
  totalBudgetRemaining: number
}

export const SATISFACTION_QUESTIONS = [
  { no: 1, section: 1, question: 'ความเหมาะสมของงบประมาณ' },
  { no: 2, section: 1, question: 'ความเหมาะสมของโครงการ/กิจกรรมกับสภาพการดำเนินการจริง' },
  { no: 3, section: 1, question: 'ความร่วมมือของบุคลากร/ผู้เกี่ยวข้อง' },
  { no: 4, section: 1, question: 'ปริมาณวัสดุอุปกรณ์เพียงพอ' },
  { no: 5, section: 1, question: 'ความเหมาะสมของสถานที่' },
  { no: 6, section: 2, question: 'ดำเนินงานตามขั้นตอนและวิธีการ' },
  { no: 7, section: 2, question: 'ความเหมาะสมของกิจกรรมและขั้นตอน' },
  { no: 8, section: 2, question: 'ขั้นตอนสามารถส่งผลให้ผู้เข้าร่วมมีคุณลักษณะที่พึงประสงค์' },
  { no: 9, section: 2, question: 'การส่งเสริมการมีส่วนร่วมระหว่างผู้รับผิดชอบ/วิทยากร/ผู้เข้าร่วม' },
  { no: 10, section: 3, question: 'ผลการดำเนินงานเป็นไปตามวัตถุประสงค์' },
  { no: 11, section: 3, question: 'ผลการดำเนินงานเป็นไปตามเป้าหมายเชิงคุณภาพ' },
  { no: 12, section: 3, question: 'ผลการดำเนินงานเป็นไปตามเป้าหมายเชิงปริมาณ' },
]

export const EVIDENCE_TYPES = [
  { key: 'PROJECT_PLAN', label: 'โครงการ/กิจกรรม' },
  { key: 'APPOINTMENT_ORDER', label: 'คำสั่งแต่งตั้งคณะกรรมการ/คณะดำเนินงาน' },
  { key: 'SUPPORTING_DOCS', label: 'เอกสารประกอบการดำเนินงาน' },
  { key: 'ACTIVITY_REPORT', label: 'บันทึกรายงานการดำเนินงาน' },
  { key: 'PARTICIPANT_LIST', label: 'รายชื่อหรือจำนวนผู้เข้าร่วมกิจกรรม' },
  { key: 'EVALUATION_FORM', label: 'แบบประเมินความพึงพอใจ' },
  { key: 'OTHER_DOCS', label: 'เอกสารหลักฐานอื่น ๆ' },
  { key: 'CERTIFICATE', label: 'เกียรติบัตร' },
  { key: 'PHOTOS', label: 'ภาพถ่ายกิจกรรม' },
]

export const WORK_GROUPS = [
  'กลุ่มบริหารวิชาการ',
  'กลุ่มบริหารงบประมาณ',
  'กลุ่มบริหารงานบุคคล',
  'กลุ่มบริหารทั่วไป',
  'กลุ่มสาระการเรียนรู้ภาษาไทย',
  'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
  'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
  'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
  'กลุ่มสาระการเรียนรู้ศิลปะ',
  'กลุ่มสาระการเรียนรู้สุขศึกษาและพลศึกษา',
  'กลุ่มสาระการเรียนรู้การงานอาชีพ',
  'กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ',
  'กิจกรรมพัฒนาผู้เรียน',
  'งานแนะแนว',
]

export const FISCAL_YEARS = ['2568', '2567', '2566', '2565', '2564', '2563']

export const PDCA_PHASES = [
  { phase: 'P', label: 'P: ขั้นการวางแผน (Plan)', color: 'blue' },
  { phase: 'D', label: 'D: ขั้นดำเนินงาน (Do)', color: 'green' },
  { phase: 'C', label: 'C: ขั้นประเมินผล (Check)', color: 'yellow' },
  { phase: 'A', label: 'A: ขั้นสรุป/รายงานผล (Act)', color: 'purple' },
]
