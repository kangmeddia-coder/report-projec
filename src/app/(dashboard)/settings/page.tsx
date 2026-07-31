import { auth } from '@/lib/auth'
import { getSchool } from '@/lib/db'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any
  const school = user.schoolId ? await getSchool(user.schoolId) : null

  return (
    <div className="p-8 max-w-4xl animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h1>
        <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลโรงเรียน ผู้บริหาร และรูปแบบเอกสารรายงาน</p>
      </div>

      <SettingsForm school={JSON.parse(JSON.stringify(school))} user={user} />
    </div>
  )
}