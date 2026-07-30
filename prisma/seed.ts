import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const school = await prisma.school.upsert({
    where: { id: 'school-001' },
    update: {},
    create: {
      id: 'school-001',
      name: 'โรงเรียนบ้านบึงโน',
      address: '123 ถ.สุขุมวิท ต.บึงโน อ.เมือง',
      district: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
      affiliation: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน',
      ministry: 'กระทรวงศึกษาธิการ',
      principalName: 'นายสมชาย ใจดี',
      planHeadName: 'นางสาววิภา รักษ์สุขภาพ',
    },
  })

  const adminPassword = await bcrypt.hash('admin1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@school.ac.th' },
    update: {},
    create: {
      email: 'admin@school.ac.th',
      name: 'ผู้ดูแลระบบ',
      password: adminPassword,
      role: 'ADMIN',
      schoolId: school.id,
    },
  })

  const teacherPassword = await bcrypt.hash('teacher1234', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.ac.th' },
    update: {},
    create: {
      email: 'teacher@school.ac.th',
      name: 'นายครูทดสอบ สอนดี',
      password: teacherPassword,
      role: 'TEACHER',
      position: 'ครู',
      academicStanding: 'ชำนาญการ',
      schoolId: school.id,
    },
  })

  const reviewerPassword = await bcrypt.hash('reviewer1234', 10)
  await prisma.user.upsert({
    where: { email: 'reviewer@school.ac.th' },
    update: {},
    create: {
      email: 'reviewer@school.ac.th',
      name: 'นางสาววิภา รักษ์สุขภาพ',
      password: reviewerPassword,
      role: 'REVIEWER',
      position: 'รองผู้อำนวยการ',
      schoolId: school.id,
    },
  })

  // ตัวอย่างรายงาน
  const report = await prisma.report.create({
    data: {
      title: 'โครงการพัฒนาทักษะดิจิทัลสำหรับครูและบุคลากร',
      activityName: 'อบรมเชิงปฏิบัติการ Google Workspace สำหรับการศึกษา',
      fiscalYear: '2568',
      workGroup: 'กลุ่มบริหารวิชาการ',
      status: 'IN_PROGRESS',
      completeness: 55,
      authorId: teacher.id,
      schoolId: school.id,
    },
  })

  await prisma.budget.create({
    data: {
      reportId: report.id,
      budgetType: 'งบอุดหนุน',
      approved: 25000,
      used: 18500,
      remaining: 6500,
    },
  })

  await prisma.project.create({
    data: {
      reportId: report.id,
      responsiblePerson: 'นายครูทดสอบ สอนดี',
      position: 'ครู ชำนาญการ',
      schoolName: 'โรงเรียนบ้านบึงโน',
      district: 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา',
      affiliation: 'สพฐ.',
      ministry: 'กระทรวงศึกษาธิการ',
      strategyItem: '3',
      strategyDetail: 'ยกระดับคุณภาพการศึกษาด้วยเทคโนโลยี',
      missionItem: '2',
      missionDetail: 'พัฒนาสมรรถนะครูและบุคลากร',
      implementationStatus: 'COMPLETED',
    },
  })

  // PDCA Items
  await prisma.pdcaItem.createMany({
    data: [
      { reportId: report.id, phase: 'P', activity: 'ประชุมวางแผนการอบรม', startDate: '2568-05-01', endDate: '2568-05-07', responsible: 'นายครูทดสอบ สอนดี', order: 1 },
      { reportId: report.id, phase: 'P', activity: 'จัดทำโครงการและขออนุมัติ', startDate: '2568-05-08', endDate: '2568-05-15', responsible: 'นายครูทดสอบ สอนดี', order: 2 },
      { reportId: report.id, phase: 'D', activity: 'ดำเนินการอบรมตามกำหนดการ', startDate: '2568-06-01', endDate: '2568-06-03', responsible: 'วิทยากรและคณะ', order: 3 },
      { reportId: report.id, phase: 'D', activity: 'ฝึกปฏิบัติการใช้เครื่องมือดิจิทัล', startDate: '2568-06-03', endDate: '2568-06-05', responsible: 'คณะวิทยากร', order: 4 },
      { reportId: report.id, phase: 'C', activity: 'ประเมินผลการอบรมและความพึงพอใจ', startDate: '2568-06-05', endDate: '2568-06-07', responsible: 'คณะกรรมการ', order: 5 },
      { reportId: report.id, phase: 'A', activity: 'สรุปผลและจัดทำรายงาน', startDate: '2568-06-08', endDate: '2568-06-15', responsible: 'นายครูทดสอบ สอนดี', order: 6 },
    ],
  })

  await prisma.objective.createMany({
    data: [
      {
        reportId: report.id,
        objective: 'เพื่อพัฒนาทักษะดิจิทัลของครูและบุคลากรในโรงเรียน',
        quantitativeTarget: 'ครูและบุคลากรเข้าร่วม 30 คน คิดเป็น 100%',
        qualitativeTarget: 'ผู้เข้าร่วมมีทักษะการใช้ Google Workspace ในระดับดีขึ้นไป',
        quantitativeResult: 'ครูและบุคลากรเข้าร่วม 28 คน คิดเป็น 93.33%',
        qualitativeResult: 'ผู้เข้าร่วม 25 คน มีทักษะผ่านเกณฑ์ คิดเป็น 89.29%',
        successPercent: 93.33,
        order: 1,
      },
    ],
  })

  await prisma.reportSummary.create({
    data: {
      reportId: report.id,
      strengths: 'ผู้เข้าร่วมให้ความร่วมมือและสนใจการอบรมเป็นอย่างดี วิทยากรมีความเชี่ยวชาญและถ่ายทอดความรู้ได้ชัดเจน',
      improvements: 'ควรเพิ่มเวลาในการฝึกปฏิบัติให้มากขึ้น และจัดเตรียมอุปกรณ์ให้พร้อม',
      suggestions: 'ควรจัดอบรมต่อเนื่องในหัวข้อขั้นสูง และติดตามผลการนำไปใช้ประโยชน์',
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('📧 Admin:    admin@school.ac.th    / admin1234')
  console.log('📧 Teacher:  teacher@school.ac.th  / teacher1234')
  console.log('📧 Reviewer: reviewer@school.ac.th / reviewer1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
