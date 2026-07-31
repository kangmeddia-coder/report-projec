import { auth } from '@/lib/auth'
import { getReportById } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import EditReportClient from '@/components/report/EditReportClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')

  const report = await getReportById(id)
  if (!report) notFound()

  return <EditReportClient report={JSON.parse(JSON.stringify(report))} />
}
