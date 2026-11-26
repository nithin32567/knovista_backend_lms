import { passwordSessionProof } from '../../shared/utils/sessionTokens';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { app } from '../../app';
import { env } from '../../config/env';
import { prisma } from '../../config/database';

describe('Welfare Module API Integration Tests', () => {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const uploadedProofFiles: string[] = [];

  let tutorRoleId: bigint;
  let tutorUserId: bigint;
  let otherTutorUserId: bigint;
  let studentId: bigint;
  let otherStudentId: bigint;
  let programId: bigint;
  let sectionId: bigint;
  let batchId: bigint;
  let studentSectionId: bigint;
  let leaveReasonId: bigint;
  let reportHeadId: bigint;

  let createdLeaveId: number;
  let createdLeaveWithoutProofId: number;
  let createdReportId: number;

  let studentToken: string;
  let otherStudentToken: string;
  let adminToken: string;
  let tutorToken: string;
  let otherTutorToken: string;

  beforeAll(async () => {
    const existingTutorRole = await prisma.institution_roles.findFirst({
      where: { name: 'Tutor' },
    });

    if (existingTutorRole) {
      tutorRoleId = existingTutorRole.id;
    } else {
      const createdRole = await prisma.institution_roles.create({
        data: {
          name: 'Tutor',
          status: 'Active',
          created_by: BigInt(1),
          updated_by: BigInt(1),
        },
      });
      tutorRoleId = createdRole.id;
    }

    const tutorUser = await prisma.institution_users.create({
      data: {
        role_id: tutorRoleId,
        first_name: 'Welfare',
        last_name: 'Tutor',
        gender: 'Other',
        email: `welfare.tutor.${uniqueSuffix}@knovista.com`,
        username: `welfaretutor_${uniqueSuffix}`,
        password: 'hashed-password-placeholder',
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    tutorUserId = tutorUser.id;

    const otherTutor = await prisma.institution_users.create({
      data: {
        role_id: tutorRoleId,
        first_name: 'Other',
        last_name: 'Tutor',
        gender: 'Other',
        email: `other.tutor.${uniqueSuffix}@knovista.com`,
        username: `othertutor_${uniqueSuffix}`,
        password: 'hashed-password-placeholder',
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    otherTutorUserId = otherTutor.id;

    const student = await prisma.students.create({
      data: {
        first_name: 'Welfare',
        last_name: 'Student',
        gender: 'Other',
        mobile_no: '9000011111',
        email: `welfare.student.${uniqueSuffix}@knovista.com`,
        username: `welfarestudent_${uniqueSuffix}`,
        password: 'hashed-password-placeholder',
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    studentId = student.id;

    const otherStudent = await prisma.students.create({
      data: {
        first_name: 'Other',
        last_name: 'Student',
        gender: 'Other',
        mobile_no: '9000022222',
        email: `other.student.${uniqueSuffix}@knovista.com`,
        username: `otherstudent_${uniqueSuffix}`,
        password: 'hashed-password-placeholder',
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    otherStudentId = otherStudent.id;

    const program = await prisma.programs.create({
      data: {
        code: `WLP-${uniqueSuffix}`,
        name: `Welfare Test Program ${uniqueSuffix}`,
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    programId = program.id;

    const section = await prisma.sections.create({
      data: {
        program_id: programId,
        code: `WLS-${uniqueSuffix}`,
        name: `Welfare Test Section ${uniqueSuffix}`,
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    sectionId = section.id;

    const batch = await prisma.program_section_batches.create({
      data: {
        section_id: sectionId,
        batch_name: `Welfare Batch ${uniqueSuffix}`,
        tutor_id: tutorUserId,
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    batchId = batch.id;

    const enrollment = await prisma.student_sections.create({
      data: {
        student_id: studentId,
        batch_id: batchId,
        status: 'Active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    studentSectionId = enrollment.id;

    const reason = await prisma.leave_reasons.create({
      data: {
        name: `Medical Reason ${uniqueSuffix}`,
        status: 'active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    leaveReasonId = reason.id;

    const reportHead = await prisma.student_report_heads.create({
      data: {
        name: `Discipline Warning ${uniqueSuffix}`,
        status: 'active',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    reportHeadId = reportHead.id;

    const admin = await prisma.institution_users.findUniqueOrThrow({ where: { id: 1n }, select: { password: true } });
    const fixtureProof = passwordSessionProof('hashed-password-placeholder', env.JWT_SECRET);
    studentToken = jwt.sign(
      { pwd: fixtureProof, sub: Number(studentId), prv: 'App\\Models\\Student' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    otherStudentToken = jwt.sign(
      { pwd: fixtureProof, sub: Number(otherStudentId), prv: 'App\\Models\\Student' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    adminToken = jwt.sign(
      { pwd: passwordSessionProof(admin.password, env.JWT_SECRET), sub: 1, prv: 'App\\Models\\InstitutionUser', role: 'Admin' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    tutorToken = jwt.sign(
      { pwd: fixtureProof, sub: Number(tutorUserId), prv: 'App\\Models\\InstitutionUser', role: 'Tutor' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    otherTutorToken = jwt.sign(
      { pwd: fixtureProof, sub: Number(otherTutorUserId), prv: 'App\\Models\\InstitutionUser', role: 'Tutor' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    for (const relPath of uploadedProofFiles) {
      const fullPath = path.resolve(process.cwd(), 'uploads', relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await prisma.student_notifications.deleteMany({
      where: { student_id: { in: [studentId, otherStudentId] } },
    });
    await prisma.admin_notifications.deleteMany({
      where: { user_id: { in: [tutorUserId, otherTutorUserId] } },
    });
    await prisma.student_leaves.deleteMany({
      where: { student_id: { in: [studentId, otherStudentId] } },
    });
    await prisma.student_reports.deleteMany({
      where: { student_id: { in: [studentId, otherStudentId] } },
    });
    await prisma.student_sections.deleteMany({
      where: { id: studentSectionId },
    });
    await prisma.program_section_batches.deleteMany({
      where: { id: batchId },
    });
    await prisma.sections.deleteMany({
      where: { id: sectionId },
    });
    await prisma.programs.deleteMany({
      where: { id: programId },
    });
    await prisma.leave_reasons.deleteMany({
      where: { id: leaveReasonId },
    });
    await prisma.student_report_heads.deleteMany({
      where: { id: reportHeadId },
    });
    await prisma.students.deleteMany({
      where: { id: { in: [studentId, otherStudentId] } },
    });
    await prisma.institution_users.deleteMany({
      where: { id: { in: [tutorUserId, otherTutorUserId] } },
    });
  });

  describe('Student Leaves API', () => {
    it('POST /api/student-leaves rejects unauthenticated and staff tokens', async () => {
      const unauth = await request(app).post('/api/student-leaves').send({});
      expect(unauth.status).toBe(401);

      const staffRes = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: Number(studentId),
          start_date: '2026-11-26',
          end_date: '2026-11-27',
          reason_id: Number(leaveReasonId),
        });
      expect(staffRes.status).toBe(401);
    });

    it('POST /api/student-leaves rejects mismatched student_id and invalid date range', async () => {
      const mismatchRes = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({
          student_id: Number(studentId),
          start_date: '2026-11-26',
          end_date: '2026-11-27',
          reason_id: Number(leaveReasonId),
        });
      expect(mismatchRes.status).toBe(403);

      const badDatesRes = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          student_id: Number(studentId),
          start_date: '2026-11-28',
          end_date: '2026-11-26',
          reason_id: Number(leaveReasonId),
        });
      expect(badDatesRes.status).toBe(422);
    });

    it('POST /api/student-leaves rejects unsupported file mime types with 422', async () => {
      const res = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('student_id', String(studentId))
        .field('start_date', '2026-11-26')
        .field('end_date', '2026-11-26')
        .field('reason_id', String(leaveReasonId))
        .attach('proof', Buffer.from('console.log(1)'), {
          filename: 'script.js',
          contentType: 'application/javascript',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/student-leaves creates leave with proof upload and notifies batch tutor', async () => {
      const res = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('student_id', String(studentId))
        .field('start_date', '2026-11-26')
        .field('end_date', '2026-11-28')
        .field('reason_id', String(leaveReasonId))
        .field('description', 'Fever and rest')
        .attach('proof', Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n'), {
          filename: 'medical.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(Number(studentId));
      expect(res.body.data.no_of_days).toBe(3);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.proof).toContain(`/api/student-leaves/${res.body.data.id}/proof`);

      createdLeaveId = res.body.data.id;

      const dbLeave = await prisma.student_leaves.findUnique({
        where: { id: BigInt(createdLeaveId) },
      });
      expect(dbLeave).not.toBeNull();
      expect(dbLeave?.proof).toBeTruthy();
      if (dbLeave?.proof) {
        uploadedProofFiles.push(dbLeave.proof);
      }

      const tutorNotif = await prisma.admin_notifications.findFirst({
        where: { user_id: tutorUserId },
        orderBy: { created_at: 'desc' },
      });
      expect(tutorNotif).not.toBeNull();
      expect(tutorNotif?.message).toContain('Welfare Student has submitted a leave request');
    });

    it('POST /api/student-leaves creates leave without proof', async () => {
      const res = await request(app)
        .post('/api/student-leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          start_date: '2026-12-01',
          end_date: '2026-12-01',
          reason_id: Number(leaveReasonId),
          description: 'Family function',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.proof).toBeNull();
      createdLeaveWithoutProofId = res.body.data.id;
    });

    it('GET /api/student-leaves enforces student and tutor scoping and returns enriched records', async () => {
      const studentRes = await request(app)
        .get('/api/student-leaves')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(studentRes.status).toBe(200);
      expect(studentRes.body.data.length).toBeGreaterThanOrEqual(2);
      expect(studentRes.body.data[0].batch.name).toContain('Welfare Batch');

      const studentCrossRes = await request(app)
        .get(`/api/student-leaves?student_id=${Number(otherStudentId)}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentCrossRes.status).toBe(403);

      const tutorRes = await request(app)
        .get(`/api/student-leaves?student_id=${Number(studentId)}`)
        .set('Authorization', `Bearer ${tutorToken}`);
      expect(tutorRes.status).toBe(200);
      expect(tutorRes.body.data.some((l: { id: number }) => l.id === createdLeaveId)).toBe(true);

      const otherTutorRes = await request(app)
        .get(`/api/student-leaves?student_id=${Number(studentId)}`)
        .set('Authorization', `Bearer ${otherTutorToken}`);
      expect(otherTutorRes.status).toBe(403);

      const adminFilteredRes = await request(app)
        .get(`/api/student-leaves?student_id=${Number(studentId)}&status=pending`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminFilteredRes.status).toBe(200);
      expect(adminFilteredRes.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/student-leaves/:id/proof requires institution_user and streams proof', async () => {
      const unauth = await request(app).get(`/api/student-leaves/${createdLeaveId}/proof`);
      expect(unauth.status).toBe(401);

      const studentAttempt = await request(app)
        .get(`/api/student-leaves/${createdLeaveId}/proof`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentAttempt.status).toBe(401);

      const staffRes = await request(app)
        .get(`/api/student-leaves/${createdLeaveId}/proof`)
        .set('Authorization', `Bearer ${tutorToken}`);
      expect(staffRes.status).toBe(200);
      expect(staffRes.headers['content-type']).toContain('application/pdf');

      const noProofRes = await request(app)
        .get(`/api/student-leaves/${createdLeaveWithoutProofId}/proof`)
        .set('Authorization', `Bearer ${tutorToken}`);
      expect(noProofRes.status).toBe(404);
    });

    it('POST /api/student-leaves/:id/authorize approves leave, notifies student, and blocks re-authorization', async () => {
      const studentAttempt = await request(app)
        .post(`/api/student-leaves/${createdLeaveId}/authorize`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'approved' });
      expect(studentAttempt.status).toBe(401);

      const approveRes = await request(app)
        .post(`/api/student-leaves/${createdLeaveId}/authorize`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({ status: 'approved', authorization_remark: 'Approved by tutor' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.success).toBe(true);
      expect(approveRes.body.data.status).toBe('approved');
      expect(approveRes.body.data.authorized_by).toBe(Number(tutorUserId));
      expect(approveRes.body.data.authorization_remark).toBe('Approved by tutor');

      const studentNotif = await prisma.student_notifications.findFirst({
        where: { student_id: studentId, type: 'leave' },
        orderBy: { created_at: 'desc' },
      });
      expect(studentNotif).not.toBeNull();
      expect(studentNotif?.title).toBe('Leave Request Approved');
      expect(studentNotif?.message).toContain('Approved by tutor');

      const repeatRes = await request(app)
        .post(`/api/student-leaves/${createdLeaveId}/authorize`)
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({ status: 'rejected' });
      expect(repeatRes.status).toBe(400);
    });
  });

  describe('Student Reports API', () => {
    it('GET /api/student-report-heads requires institution_user and returns active heads', async () => {
      const studentAttempt = await request(app)
        .get('/api/student-report-heads')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentAttempt.status).toBe(401);

      const res = await request(app)
        .get('/api/student-report-heads')
        .set('Authorization', `Bearer ${tutorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((h: { id: number }) => h.id === Number(reportHeadId))).toBe(true);
    });

    it('POST /api/student-reports validates payload and creates disciplinary report', async () => {
      const invalidRes = await request(app)
        .post('/api/student-reports')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({});
      expect(invalidRes.status).toBe(422);

      const missingHeadRes = await request(app)
        .post('/api/student-reports')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          student_id: Number(studentId),
          report_head_id: 999999,
          description: 'Test',
        });
      expect(missingHeadRes.status).toBe(404);

      const createRes = await request(app)
        .post('/api/student-reports')
        .set('Authorization', `Bearer ${tutorToken}`)
        .send({
          student_id: Number(studentId),
          report_head_id: Number(reportHeadId),
          description: 'Missed morning standup twice',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.report_head).toContain('Discipline Warning');
      expect(createRes.body.data.created_by.role).toBe('Tutor');
      createdReportId = createRes.body.data.id;
    });

    it('GET /api/student-reports/list scopes by staff role and filters properly', async () => {
      const tutorRes = await request(app)
        .get(`/api/student-reports/list?student_id=${Number(studentId)}&report_head_id=${Number(reportHeadId)}`)
        .set('Authorization', `Bearer ${tutorToken}`);
      expect(tutorRes.status).toBe(200);
      expect(tutorRes.body.data.some((r: { id: number }) => r.id === createdReportId)).toBe(true);

      const outOfScopeTutorRes = await request(app)
        .get(`/api/student-reports/list?student_id=${Number(studentId)}`)
        .set('Authorization', `Bearer ${otherTutorToken}`);
      expect(outOfScopeTutorRes.status).toBe(403);

      const adminRoleFilterRes = await request(app)
        .get(`/api/student-reports/list?student_id=${Number(studentId)}&role=Tutor`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRoleFilterRes.status).toBe(200);
      expect(adminRoleFilterRes.body.data.some((r: { id: number }) => r.id === createdReportId)).toBe(true);
    });

    it('DELETE /api/student-reports/:id soft-deletes report and removes from subsequent queries', async () => {
      const studentAttempt = await request(app)
        .delete(`/api/student-reports/${createdReportId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentAttempt.status).toBe(401);

      const deleteRes = await request(app)
        .delete(`/api/student-reports/${createdReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const repeatDeleteRes = await request(app)
        .delete(`/api/student-reports/${createdReportId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(repeatDeleteRes.status).toBe(404);

      const listAfterDeleteRes = await request(app)
        .get(`/api/student-reports/list?student_id=${Number(studentId)}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listAfterDeleteRes.status).toBe(200);
      expect(listAfterDeleteRes.body.data.some((r: { id: number }) => r.id === createdReportId)).toBe(false);
    });
  });
});
