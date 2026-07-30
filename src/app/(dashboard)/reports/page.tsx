import ReportsClient from '@/components/report/ReportsClient'
import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

export default async function ReportsPage() {
  const session = await auth()
  const user = session?.user as any
  const where = user?.role === 'TEACHER' ? { authorId: user?.id } : {}
  const prisma = getPrisma()

  const reports = await prisma.report.findMany({
    where,
    include: {
      author: { select: { name: true } },
      budget: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return <ReportsClient reports={JSON.parse(JSON.stringify(reports))} userRole={user?.role} />
}
 
export const runtime = 'edge'; 
