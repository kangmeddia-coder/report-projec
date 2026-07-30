import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'ระบบรายงานผลโครงการ/กิจกรรม',
  description: 'ระบบบันทึกและจัดการรายงานผลการดำเนินงานโครงการและกิจกรรมของโรงเรียน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sarabun antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
export const runtime = 'edge'; 
