import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any
  const prisma = getPrisma()

  const school = user.schoolId ? await prisma.school.findUnique({ where: { id: user.schoolId } }) : null

  return (
    <div className="p-8 max-w-3xl animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h1>
        <p className="text-slate-500 text-sm mt-1">ข้อมูลโรงเรียนและการตั้งค่าต่างๆ</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>🏫</span> ข้อมูลโรงเรียน
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'ชื่อโรงเรียน', value: school?.name || '-' },
            { label: 'ที่อยู่', value: school?.address || '-' },
            { label: 'สำนักงานเขตพื้นที่', value: school?.district || '-' },
            { label: 'สังกัด', value: school?.affiliation || '-' },
            { label: 'กระทรวง', value: school?.ministry || '-' },
            { label: 'ผู้อำนวยการ', value: school?.principalName || '-' },
            { label: 'หัวหน้างานแผน', value: school?.planHeadName || '-' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span>👤</span> ข้อมูลผู้ใช้งาน
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'ชื่อ-นามสกุล', value: user?.name || '-' },
            { label: 'อีเมล', value: user?.email || '-' },
            { label: 'บทบาท', value: { ADMIN: 'ผู้ดูแลระบบ', TEACHER: 'ครู/บุคลากร', REVIEWER: 'ผู้ตรวจสอบ' }[user?.role as string] || '-' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        💡 การแก้ไขข้อมูลโรงเรียนและบัญชีผู้ใช้ จะพัฒนาใน Phase 2
      </div>
    </div>
  )
}
 
export const runtime = 'edge'; 
