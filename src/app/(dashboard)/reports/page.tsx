import ReportsClient from '@/components/report/ReportsClient'
import { auth } from '@/lib/auth'
import { getReports } from '@/lib/db'

export default async function ReportsPage() {
  const session = await auth()
  const user = session?.user as any
  const reports = await getReports(user?.id, user?.role)

  return <ReportsClient reports={JSON.parse(JSON.stringify(reports))} userRole={user?.role} />
}