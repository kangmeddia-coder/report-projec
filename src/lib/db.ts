/**
 * D1 Database helper — bypasses Prisma adapter (which silently fails on Cloudflare Workers)
 * Uses Cloudflare D1 native API directly via getCloudflareContext()
 */
import { getCloudflareContext } from '@opennextjs/cloudflare'

export function getD1() {
  try {
    const ctx = getCloudflareContext()
    return ctx?.env?.school_db as any
  } catch {
    return null
  }
}

// ─── ID Generation ─────────────────────────────────────────────────────────────
export function newId(): string {
  return Math.random().toString(36).slice(2, 11) + Math.random().toString(36).slice(2, 11)
}

// ─── Reports ───────────────────────────────────────────────────────────────────
export async function getReports(userId: string, role: string) {
  const d1 = getD1()
  if (!d1) return []

  const isTeacher = role === 'TEACHER'
  const sql = `
    SELECT r.id, r.title, r.activityName, r.fiscalYear, r.workGroup, r.status, r.completeness,
           r.authorId, r.schoolId, r.createdAt, r.updatedAt,
           u.name as authorName,
           b.approved as budgetApproved, b.used as budgetUsed, b.remaining as budgetRemaining, b.budgetType
    FROM "Report" r
    LEFT JOIN "User" u ON r.authorId = u.id
    LEFT JOIN "Budget" b ON r.id = b.reportId
    ${isTeacher ? 'WHERE r.authorId = ?' : ''}
    ORDER BY r.updatedAt DESC
  `
  const result = await d1.prepare(sql).bind(...(isTeacher ? [userId] : [])).all()
  return (result?.results || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    activityName: r.activityName,
    fiscalYear: r.fiscalYear,
    workGroup: r.workGroup,
    status: r.status,
    completeness: r.completeness || 0,
    authorId: r.authorId,
    schoolId: r.schoolId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    author: { name: r.authorName },
    budget: r.budgetApproved != null ? {
      approved: r.budgetApproved,
      used: r.budgetUsed,
      remaining: r.budgetRemaining,
      budgetType: r.budgetType,
    } : null,
  }))
}

export async function getReportById(id: string) {
  const d1 = getD1()
  if (!d1) return null

  const [report, project, budget, pdcaItems, objectives, achievementScore,
    satisfactionSurvey, reportSummary, evidenceDocs, activityPhotos, signatories, comments] =
    await Promise.all([
      d1.prepare(`
        SELECT r.*, u.name as authorName, u.email as authorEmail,
               s.name as schoolName, s.address as schoolAddress,
               s.district as schoolDistrict, s.affiliation as schoolAffiliation,
               s.ministry as schoolMinistry, s.principalName as schoolPrincipalName,
               s.planHeadName as schoolPlanHeadName, s.fontFamily as schoolFontFamily,
               s.paperSize as schoolPaperSize
        FROM "Report" r
        LEFT JOIN "User" u ON r.authorId = u.id
        LEFT JOIN "School" s ON r.schoolId = s.id
        WHERE r.id = ?
      `).bind(id).first(),
      d1.prepare(`SELECT * FROM "Project" WHERE reportId = ?`).bind(id).first(),
      d1.prepare(`SELECT * FROM "Budget" WHERE reportId = ?`).bind(id).first(),
      d1.prepare(`SELECT * FROM "PdcaItem" WHERE reportId = ? ORDER BY "order" ASC`).bind(id).all(),
      d1.prepare(`SELECT * FROM "Objective" WHERE reportId = ? ORDER BY "order" ASC`).bind(id).all(),
      d1.prepare(`SELECT * FROM "AchievementScore" WHERE reportId = ?`).bind(id).first(),
      d1.prepare(`SELECT * FROM "SatisfactionSurvey" WHERE reportId = ?`).bind(id).first(),
      d1.prepare(`SELECT * FROM "ReportSummary" WHERE reportId = ?`).bind(id).first(),
      d1.prepare(`SELECT * FROM "EvidenceDocument" WHERE reportId = ?`).bind(id).all(),
      d1.prepare(`SELECT * FROM "ActivityPhoto" WHERE reportId = ? ORDER BY "order" ASC`).bind(id).all(),
      d1.prepare(`SELECT * FROM "Signatory" WHERE reportId = ?`).bind(id).all(),
      d1.prepare(`
        SELECT c.*, u.name as authorName, u.role as authorRole
        FROM "WorkflowComment" c
        LEFT JOIN "User" u ON c.authorId = u.id
        WHERE c.reportId = ?
        ORDER BY c.createdAt ASC
      `).bind(id).all(),
    ])

  if (!report) return null

  let surveyWithAnswers = satisfactionSurvey
  if (satisfactionSurvey) {
    const answers = await d1.prepare(`SELECT * FROM "SatisfactionAnswer" WHERE surveyId = ?`)
      .bind((satisfactionSurvey as any).id).all()
    surveyWithAnswers = { ...satisfactionSurvey, answers: answers?.results || [] }
  }

  return {
    ...report,
    author: { name: (report as any).authorName, email: (report as any).authorEmail },
    school: report ? {
      id: (report as any).schoolId,
      name: (report as any).schoolName,
      address: (report as any).schoolAddress,
      district: (report as any).schoolDistrict,
      affiliation: (report as any).schoolAffiliation,
      ministry: (report as any).schoolMinistry,
      principalName: (report as any).schoolPrincipalName,
      planHeadName: (report as any).schoolPlanHeadName,
      fontFamily: (report as any).schoolFontFamily,
      paperSize: (report as any).schoolPaperSize,
    } : null,
    project: project || null,
    budget: budget || null,
    pdcaItems: pdcaItems?.results || [],
    objectives: objectives?.results || [],
    achievementScore: achievementScore || null,
    satisfactionSurvey: surveyWithAnswers || null,
    reportSummary: reportSummary || null,
    evidenceDocs: evidenceDocs?.results || [],
    activityPhotos: activityPhotos?.results || [],
    signatories: signatories?.results || [],
    comments: comments?.results || [],
  }
}

export async function createReport(data: any) {
  const d1 = getD1()
  if (!d1) throw new Error('D1 not available')

  const id = newId()
  const now = new Date().toISOString()
  await d1.prepare(`
    INSERT INTO "Report" (id, title, activityName, fiscalYear, workGroup, status, completeness,
      authorId, schoolId, lastSavedAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, data.title, data.activityName, data.fiscalYear, data.workGroup || null,
    data.status || 'IN_PROGRESS', data.completeness || 0,
    data.authorId, data.schoolId || null, now, now, now).run()

  return { id, ...data, createdAt: now, updatedAt: now }
}

export async function updateReport(id: string, body: any) {
  const d1 = getD1()
  if (!d1) throw new Error('D1 not available')

  const now = new Date().toISOString()

  // 1. Update main Report table
  const reportUpdates: string[] = []
  const reportVals: any[] = []

  if (body.title !== undefined) { reportUpdates.push('title=?'); reportVals.push(body.title) }
  if (body.activityName !== undefined) { reportUpdates.push('activityName=?'); reportVals.push(body.activityName) }
  if (body.fiscalYear !== undefined) { reportUpdates.push('fiscalYear=?'); reportVals.push(body.fiscalYear) }
  if (body.workGroup !== undefined) { reportUpdates.push('workGroup=?'); reportVals.push(body.workGroup) }
  if (body.status !== undefined) { reportUpdates.push('status=?'); reportVals.push(body.status) }
  if (body.completeness !== undefined) { reportUpdates.push('completeness=?'); reportVals.push(body.completeness) }
  if (body.preface !== undefined) { reportUpdates.push('preface=?'); reportVals.push(body.preface) }

  reportUpdates.push('lastSavedAt=?'); reportVals.push(now)
  reportUpdates.push('updatedAt=?'); reportVals.push(now)

  if (reportUpdates.length > 0) {
    await d1.prepare(`UPDATE "Report" SET ${reportUpdates.join(',')} WHERE id=?`)
      .bind(...reportVals, id).run()
  }

  // 2. Upsert Project table
  const hasProjectData = [
    body.responsiblePerson, body.position, body.schoolName, body.district,
    body.affiliation, body.ministry, body.strategyItem, body.strategyDetail,
    body.missionItem, body.missionDetail, body.standardRef, body.standardItem,
    body.implementationStatus, body.cancellationReason
  ].some(v => v !== undefined)

  if (hasProjectData) {
    const existing = await d1.prepare(`SELECT id FROM "Project" WHERE reportId=?`).bind(id).first()
    const cols = ['responsiblePerson','position','schoolName','district','affiliation','ministry',
      'strategyItem','strategyDetail','missionItem','missionDetail','standardRef','standardItem',
      'implementationStatus','cancellationReason','updatedAt']
    const vals = [
      body.responsiblePerson ?? null, body.position ?? null, body.schoolName ?? null,
      body.district ?? null, body.affiliation ?? null, body.ministry ?? null,
      body.strategyItem ?? null, body.strategyDetail ?? null,
      body.missionItem ?? null, body.missionDetail ?? null,
      body.standardRef ?? null, body.standardItem ?? null,
      body.implementationStatus || 'COMPLETED', body.cancellationReason ?? null, now
    ]
    if (existing) {
      await d1.prepare(`UPDATE "Project" SET ${cols.map(c => `${c}=?`).join(',')} WHERE reportId=?`)
        .bind(...vals, id).run()
    } else {
      await d1.prepare(`INSERT INTO "Project" (id,reportId,${cols.join(',')},createdAt) VALUES (?,?,${cols.map(() => '?').join(',')},?)`)
        .bind(newId(), id, ...vals, now).run()
    }
  }

  // 3. Upsert Budget table
  const hasBudgetData = body.approved !== undefined || body.used !== undefined || body.budgetType !== undefined
  if (hasBudgetData) {
    const existing = await d1.prepare(`SELECT id FROM "Budget" WHERE reportId=?`).bind(id).first()
    const approved = Number(body.approved || 0)
    const used = Number(body.used || 0)
    const remaining = approved - used
    if (existing) {
      await d1.prepare(`UPDATE "Budget" SET budgetType=?,approved=?,used=?,remaining=?,updatedAt=? WHERE reportId=?`)
        .bind(body.budgetType ?? null, approved, used, remaining, now, id).run()
    } else {
      await d1.prepare(`INSERT INTO "Budget" (id,reportId,budgetType,approved,used,remaining,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(newId(), id, body.budgetType ?? '', approved, used, remaining, now, now).run()
    }
  }

  // 4. Replace PDCA Items
  if (body.pdcaItems) {
    await d1.prepare(`DELETE FROM "PdcaItem" WHERE reportId=?`).bind(id).run()
    let order = 0
    for (const phase of ['P', 'D', 'C', 'A']) {
      for (const item of body.pdcaItems[phase] || []) {
        if (!item.activity?.trim()) continue
        await d1.prepare(`INSERT INTO "PdcaItem" (id,reportId,phase,activity,startDate,endDate,responsible,"order",createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`)
          .bind(newId(), id, phase, item.activity, item.startDate ?? null, item.endDate ?? null,
            item.responsible ?? null, order++, now, now).run()
      }
    }
  }

  // 5. Replace Objectives
  if (body.objectives) {
    await d1.prepare(`DELETE FROM "Objective" WHERE reportId=?`).bind(id).run()
    for (let i = 0; i < body.objectives.length; i++) {
      const obj = body.objectives[i]
      if (!obj.objective?.trim()) continue
      await d1.prepare(`INSERT INTO "Objective" (id,reportId,objective,quantitativeTarget,qualitativeTarget,quantitativeResult,qualitativeResult,successPercent,"order",createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(newId(), id, obj.objective, obj.quantitativeTarget ?? null, obj.qualitativeTarget ?? null,
          obj.quantitativeResult ?? null, obj.qualitativeResult ?? null, Number(obj.successPercent || 0),
          i, now, now).run()
    }
  }

  // 6. Upsert Achievement Score
  const hasAchievementData = body.qualityPercent !== undefined || body.quantityTarget !== undefined
  if (hasAchievementData) {
    const existing = await d1.prepare(`SELECT id FROM "AchievementScore" WHERE reportId=?`).bind(id).first()
    const qPct = Number(body.qualityPercent || 0)
    const qLevel = body.qualityLevel || (qPct >= 80 ? 'ยอดเยี่ยม' : qPct >= 70 ? 'ดีเลิศ' : qPct >= 60 ? 'ดี' : qPct >= 50 ? 'ปานกลาง' : 'ปรับปรุง')
    if (existing) {
      await d1.prepare(`UPDATE "AchievementScore" SET qualityPercent=?,qualityLevel=?,quantityTarget=?,quantityActual=?,quantityPercent=?,quantityLevel=?,updatedAt=? WHERE reportId=?`)
        .bind(qPct, qLevel, Number(body.quantityTarget || 0),
          Number(body.quantityActual || 0), Number(body.quantityPercent || 0), body.quantityLevel ?? null, now, id).run()
    } else {
      await d1.prepare(`INSERT INTO "AchievementScore" (id,reportId,qualityPercent,qualityLevel,quantityTarget,quantityActual,quantityPercent,quantityLevel,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .bind(newId(), id, qPct, qLevel,
          Number(body.quantityTarget || 0), Number(body.quantityActual || 0),
          Number(body.quantityPercent || 0), body.quantityLevel ?? null, now, now).run()
    }
  }

  // 7. Upsert Report Summary
  const hasSummaryData = body.strengths !== undefined || body.improvements !== undefined || body.suggestions !== undefined
  if (hasSummaryData) {
    const existing = await d1.prepare(`SELECT id FROM "ReportSummary" WHERE reportId=?`).bind(id).first()
    if (existing) {
      await d1.prepare(`UPDATE "ReportSummary" SET strengths=?,improvements=?,suggestions=?,updatedAt=? WHERE reportId=?`)
        .bind(body.strengths ?? null, body.improvements ?? null, body.suggestions ?? null, now, id).run()
    } else {
      await d1.prepare(`INSERT INTO "ReportSummary" (id,reportId,strengths,improvements,suggestions,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)`)
        .bind(newId(), id, body.strengths ?? '', body.improvements ?? '', body.suggestions ?? '', now, now).run()
    }
  }

  // 8. Upsert Signatories
  if (body.signatories) {
    for (const role of ['REPORTER', 'PLAN_HEAD', 'PRINCIPAL']) {
      const sig = body.signatories[role]
      if (!sig?.name) continue
      const existing = await d1.prepare(`SELECT id FROM "Signatory" WHERE reportId=? AND role=?`).bind(id, role).first()
      if (existing) {
        await d1.prepare(`UPDATE "Signatory" SET name=?,position=?,academicStanding=?,updatedAt=? WHERE id=?`)
          .bind(sig.name, sig.position ?? null, sig.academicStanding ?? null, now, (existing as any).id).run()
      } else {
        await d1.prepare(`INSERT INTO "Signatory" (id,reportId,role,name,position,academicStanding,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`)
          .bind(newId(), id, role, sig.name, sig.position ?? null, sig.academicStanding ?? null, now, now).run()
      }
    }
  }

  // 9. Activity Photos (Image URLs)
  if (body.activityPhotos) {
    await d1.prepare(`DELETE FROM "ActivityPhoto" WHERE reportId=?`).bind(id).run()
    let order = 0
    for (const photo of body.activityPhotos || []) {
      if (!photo.url?.trim()) continue
      await d1.prepare(`INSERT INTO "ActivityPhoto" (id,reportId,url,caption,"order",includeInReport,layout,createdAt) VALUES (?,?,?,?,?,?,?,?)`)
        .bind(newId(), id, photo.url.trim(), photo.caption || '', order++, photo.includeInReport !== false ? 1 : 0, photo.layout || 'TWO_PER_PAGE', now).run()
    }
  }

  // 10. Evidence Documents
  if (body.evidenceDocs) {
    await d1.prepare(`DELETE FROM "EvidenceDocument" WHERE reportId=?`).bind(id).run()
    for (const [docType, hasDoc] of Object.entries(body.evidenceDocs)) {
      await d1.prepare(`INSERT INTO "EvidenceDocument" (id,reportId,docType,hasDoc,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`)
        .bind(newId(), id, docType, hasDoc ? 1 : 0, now, now).run()
    }
  }

  return { id, ...body, updatedAt: now }
}

export async function deleteReport(id: string) {
  const d1 = getD1()
  if (!d1) throw new Error('D1 not available')
  await d1.prepare(`DELETE FROM "Report" WHERE id=?`).bind(id).run()
}

export async function updateReportStatus(id: string, status: string, comment?: string, authorId?: string) {
  const d1 = getD1()
  if (!d1) throw new Error('D1 not available')

  const now = new Date().toISOString()
  await d1.prepare(`UPDATE "Report" SET status=?, updatedAt=? WHERE id=?`).bind(status, now, id).run()

  if (comment && authorId) {
    await d1.prepare(`INSERT INTO "WorkflowComment" (id, reportId, content, authorId, createdAt) VALUES (?,?,?,?,?)`)
      .bind(newId(), id, comment, authorId, now).run()
  }

  return { id, status, updatedAt: now }
}

export async function getSchool(schoolId: string) {
  const d1 = getD1()
  if (!d1) return null
  return await d1.prepare(`SELECT * FROM "School" WHERE id=?`).bind(schoolId).first()
}

export async function updateSchool(schoolId: string, data: any) {
  const d1 = getD1()
  if (!d1) throw new Error('D1 not available')
  const now = new Date().toISOString()
  await d1.prepare(`
    UPDATE "School" SET name=?,address=?,district=?,affiliation=?,ministry=?,
      principalName=?,planHeadName=?,fontFamily=?,paperSize=?,docNumberFormat=?,updatedAt=?
    WHERE id=?
  `).bind(
    data.name ?? null, data.address ?? null, data.district ?? null,
    data.affiliation ?? null, data.ministry ?? null,
    data.principalName ?? null, data.planHeadName ?? null,
    data.fontFamily ?? 'Sarabun', data.paperSize ?? 'A4',
    data.docNumberFormat ?? null, now, schoolId
  ).run()
  return { id: schoolId, ...data, updatedAt: now }
}
