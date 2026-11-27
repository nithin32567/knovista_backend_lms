import { beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { passwordSessionProof } from '../../shared/utils/sessionTokens';

const db = vi.hoisted(() => ({
  revoked_sessions: { findUnique: vi.fn() },
  students: { findUnique: vi.fn() },
  institution_users: { findUnique: vi.fn() },
  student_sections: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn() },
  program_section_batches: { findUnique: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../../config/database', () => ({ prisma: db }));

const passwordHash = 'course-test-password-version';
const studentId = 7;

function authorization(account: 'Student' | 'InstitutionUser', id: number): string {
  const token = jwt.sign(
    { sub: id, prv: `App\\Models\\${account}`, pwd: passwordSessionProof(passwordHash, env.JWT_SECRET) },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `Bearer ${token}`;
}

const section = { id: 9n, program_id: 3n, code: 'WEB', name: 'Web development', status: 'Active',
  duration_in_months: 3, amount: null, cover_image: '/storage/sections/course.png' };
const batch = { id: 10n, section_id: 9n, batch_name: 'November', tutor_id: null, qa_id: null,
  placement_officer_id: null, start_date: new Date('2026-11-01'), end_date: new Date('2027-02-01'),
  status: 'Active', created_by: 1n, updated_by: 1n, created_at: null, updated_at: null, section };
const enrollment = { id: 11n, student_id: 7n, batch_id: 10n, status: 'Active', progress_percent: 0,
  start_date: null, end_date: null, created_by: 1n, updated_by: 1n, created_at: null, updated_at: null, batch };

beforeEach(() => {
  vi.resetAllMocks();
  db.revoked_sessions.findUnique.mockResolvedValue(null);
  db.students.findUnique.mockResolvedValue({ id: 7n, status: 'Active', password: passwordHash });
  db.institution_users.findUnique.mockResolvedValue({
    id: 1n, status: 'Active', password: passwordHash, role: { name: 'Admin', status: 'Active' },
  });
});

describe('Curriculum and Batch API Integration Tests', () => {
  it('GET /api/v1/programs should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/programs');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/sections should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/sections');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/modules should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/modules');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/topics should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/topics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/special-categories should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/special-categories');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/program-section-batches should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/program-section-batches');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/student-sections should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/student-sections');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/student/my-batches should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/student/my-batches');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/student/forgot-password should validate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/student/forgot-password')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/student/reset-password should validate matching passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/student/reset-password')
      .send({
        token: 'token-abc',
        password: 'Password123!',
        password_confirmation: 'DifferentPassword123!',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/institution-role/permissions should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/institution-role/permissions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin-notifications should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin-notifications');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


describe('Student course routes', () => {
  it('requires authentication on both Laravel-compatible routes', async () => {
    for (const route of ['getStudentSections', 'getStudentSectionDetails']) {
      const res = await request(app).post(`/api/student/${route}`).send({});
      expect(res.status).toBe(401);
    }
  });

  it('rejects another student ID and invalid section IDs before querying enrollments', async () => {
    const auth = authorization('Student', studentId);
    const res = await request(app).post('/api/student/getStudentSections')
      .set('Authorization', auth).send({ student_id: 8 });
    const invalid = await request(app).post('/api/student/getStudentSectionDetails')
      .set('Authorization', auth).send({ section_id: '9x' });
    expect(res.status).toBe(403);
    expect(invalid.status).toBe(422);
    expect(db.student_sections.findMany).not.toHaveBeenCalled();
    expect(db.student_sections.findFirst).not.toHaveBeenCalled();
  });

  it('lists only the signed-in student’s courses and uses batch dates when enrollment dates are absent', async () => {
    db.student_sections.findMany.mockResolvedValue([enrollment]);
    const res = await request(app).post('/api/student/getStudentSections')
      .set('Authorization', authorization('Student', studentId)).send({ student_id: '7' });
    expect(res.status).toBe(200);
    expect(db.student_sections.findMany.mock.calls[0]?.[0].where.student_id).toBe(7n);
    expect(res.body.data).toMatchObject([{ section_id: 9, section_name: 'Web development',
      expected_start_date: '2026-11-01T00:00:00.000Z', batch: { id: 10, program_id: 3 } }]);
  });

  it('returns accessible questions and progress while hiding locked content and answer keys', async () => {
    const question = { id: 50n, question: 'Pick A', options: { Option1: 'A' }, priority: 1,
      status: 'Active', answer: { Answer1: 'A' }, correct_answer: 'A' };
    const assignment = (moduleId: bigint, status: string, topicType: string, fileUrl: string | null) => ({
      module_id: moduleId, status, unlock_requested_at: null, unlocked_at: null,
      module: { id: moduleId, name: 'Course module', order: Number(moduleId), status: 'Active' },
      student_section_module_topics: [{
        id: moduleId + 20n, status: 'completed', topic_started_at: null, topic_last_accessed_at: null, topic_completed_at: null,
        topic: {
          id: moduleId + 30n, module_id: moduleId, name: 'Lesson', type: topicType, file_url: fileUrl, content_url: null,
          cover_image: null, day_count: 1, priority: 1, order: 1, status: 'Active', topic_assessments: [question],
        },
      }],
    });
    db.student_sections.findFirst.mockResolvedValue({
      ...enrollment,
      student_section_modules: [assignment(1n, 'Unlocked', 'mcq', null), assignment(2n, 'Locked', 'video', 'locked-video')],
    });
    const res = await request(app).post('/api/student/getStudentSectionDetails')
      .set('Authorization', authorization('Student', studentId)).send({ section_id: 9 });
    expect(res.status).toBe(200);
    expect(db.student_sections.findFirst.mock.calls[0]?.[0].where).toMatchObject({ student_id: 7n, batch: { section_id: 9n } });
    expect(res.body.data.modules).toMatchObject([
      { student_module_status: 'active', topics: [{ student_topic_id: 21, student_topic_status: 'completed',
        type: 'MCQ', assessments: [{ id: 50, options: '{"Option1":"A"}' }] }] },
      { student_module_status: 'new', topics: [{ type: 'Video', file_url: null, assessments: [] }] },
    ]);
    expect(res.body.data.modules[0].topics[0].assessments[0]).not.toHaveProperty('answer');
    expect(res.body.data.modules[0].topics[0].assessments[0]).not.toHaveProperty('correct_answer');
    expect(JSON.stringify(res.body)).not.toContain('locked-video');
  });

  it('returns 404 for a section without an enrollment owned by the student', async () => {
    db.student_sections.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/student/getStudentSectionDetails')
      .set('Authorization', authorization('Student', studentId)).send({ section_id: 9 });
    expect(res.status).toBe(404);
  });

  it('initializes lesson progress for unlocked and locked modules in the enrollment transaction', async () => {
    db.program_section_batches.findUnique.mockResolvedValue(batch);
    db.student_sections.findUnique.mockResolvedValue(null);
    const tx = {
      program_section_batches: db.program_section_batches,
      students: db.students,
      student_sections: { create: vi.fn().mockResolvedValue(enrollment) },
      modules: { findMany: vi.fn().mockResolvedValue([{ id: 1n, topics: [{ id: 30n }] }, { id: 2n, topics: [{ id: 31n }] }]) },
      student_section_modules: { create: vi.fn().mockResolvedValueOnce({ id: 20n }).mockResolvedValueOnce({ id: 21n }) },
      student_section_module_topics: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    db.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx));
    const res = await request(app).post('/api/student-sections')
      .set('Authorization', authorization('InstitutionUser', 1)).send({ student_id: 7, batch_id: 10 });
    expect(res.status).toBe(201);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.student_section_modules.create).toHaveBeenNthCalledWith(1, {
      data: { student_id: 7n, student_section_id: 11n, module_id: 1n, status: 'Unlocked' },
    });
    expect(tx.student_section_module_topics.createMany).toHaveBeenNthCalledWith(1, {
      data: [{ student_id: 7n, student_section_module_id: 20n, topic_id: 30n, status: 'active', created_by: 1n }],
    });
    expect(tx.student_section_module_topics.createMany).toHaveBeenNthCalledWith(2, {
      data: [{ student_id: 7n, student_section_module_id: 21n, topic_id: 31n, status: 'new', created_by: 1n }],
    });
  });
  it('removes lesson and module records in the enrollment removal transaction', async () => {
    const tx = {
      student_sections: { findUnique: vi.fn().mockResolvedValue(enrollment), delete: vi.fn() },
      student_section_module_topics: { findMany: vi.fn().mockResolvedValue([{ id: 20n }]), deleteMany: vi.fn() },
      student_topic_assessment_answers: { deleteMany: vi.fn() },
      student_section_modules: { deleteMany: vi.fn() },
    };
    db.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx));
    const res = await request(app).delete('/api/student-sections/11')
      .set('Authorization', authorization('InstitutionUser', 1));
    expect(res.status).toBe(200);
    expect(tx.student_topic_assessment_answers.deleteMany).toHaveBeenCalledWith({ where: { student_topic_id: { in: [20n] } } });
    expect(tx.student_section_module_topics.deleteMany).toHaveBeenCalledBefore(tx.student_section_modules.deleteMany);
    expect(tx.student_section_modules.deleteMany).toHaveBeenCalledBefore(tx.student_sections.delete);
  });

});
