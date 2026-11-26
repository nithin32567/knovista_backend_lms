import { beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { passwordSessionProof } from '../../shared/utils/sessionTokens';

const db = vi.hoisted(() => ({
  students: { findUnique: vi.fn() },
  institution_users: { findUnique: vi.fn() },
  student_sections: { findFirst: vi.fn() },
  revoked_sessions: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  student_section_modules: { findFirst: vi.fn(), updateMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../../config/database', () => ({ prisma: db }));

const passwordHash = 'test-password-version';
const authorization = (id: number, account: 'Student' | 'InstitutionUser') => {
  const token = jwt.sign(
    { sub: id, prv: `App\\Models\\${account}`, pwd: passwordSessionProof(passwordHash, env.JWT_SECRET) },
    env.JWT_SECRET,
    { expiresIn: '1h' },
  );
  return `Bearer ${token}`;
};

beforeEach(() => {
  vi.resetAllMocks();
  db.revoked_sessions.findUnique.mockResolvedValue(null);
});

describe('Progress and Evaluation API Integration Tests', () => {
  it('POST /api/v1/student-section-topics/complete should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/student-section-topics/complete')
      .send({ student_topic_id: 1 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/student-sections/request-unlock-next-module requires a student session', async () => {
    const res = await request(app)
      .post('/api/v1/student-sections/request-unlock-next-module')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

  });

  it('GET /api/v1/student-sections/module-unlock-requests should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/student-sections/module-unlock-requests');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/student-sections/approve-module-unlock should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/student-sections/approve-module-unlock')
      .send({
        student_id: 10,
        section_id: 1,
        student_section_id: 2,
        module_id: 3,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/student-sections/complete-course should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/student-sections/complete-course')
      .send({ student_section_id: 2 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/performances should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/performances');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/performances should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/performances')
      .send({
        student_section_module_id: 1,
        performance: 'excellent',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/performances/:id should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/performances/1');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/v1/performances/:id should reject unauthorized requests with 401', async () => {
    const res = await request(app).delete('/api/v1/performances/1');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/students/completed-modules should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/students/completed-modules?student_id=10');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('allows students to read their own module performance', async () => {
    db.students.findUnique.mockResolvedValue({ id: 12n, status: 'Active', password: passwordHash });
    db.student_sections.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/students/12/module-performance')
      .set('Authorization', authorization(12, 'Student'));

    expect(response.status).toBe(200);
    expect(response.body.student.id).toBe(12);
  });

  it('keeps module performance private to the student', async () => {
    db.students.findUnique.mockResolvedValue({ id: 12n, status: 'Active', password: passwordHash });

    const response = await request(app)
      .get('/api/v1/students/13/module-performance')
      .set('Authorization', authorization(12, 'Student'));

    expect(response.status).toBe(403);
    expect(db.student_sections.findFirst).not.toHaveBeenCalled();
  });

  it('limits tutor approval lookup to the tutor’s assigned batch', async () => {
    db.institution_users.findUnique.mockResolvedValue({
      id: 5n, status: 'Active', password: passwordHash, role: { name: 'Tutor', status: 'Active' },
    });
    db.$transaction.mockImplementation(async (work: (tx: typeof db) => Promise<unknown>) => work(db));
    db.student_section_modules.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/student-sections/approve-module-unlock')
      .set('Authorization', authorization(5, 'InstitutionUser'))
      .send({ student_id: 12, section_id: 2, student_section_id: 3, module_id: 4 });

    expect(response.status).toBe(404);
    expect(db.student_section_modules.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        student_section: expect.objectContaining({ student_id: 12n, batch: { tutor_id: 5n, section_id: 2n } }),
      }),
    }));
    expect(db.student_section_modules.updateMany).not.toHaveBeenCalled();
  });

  it('requires a new login after the password changes', async () => {
    db.students.findUnique.mockResolvedValue({ id: 12n, status: 'Active', password: 'new-password-version' });

    const response = await request(app)
      .get('/api/v1/students/12/module-performance')
      .set('Authorization', authorization(12, 'Student'));

    expect(response.status).toBe(401);
  });

  it('rejects a session after logout', async () => {
    db.students.findUnique.mockResolvedValue({ id: 12n, status: 'Active', password: passwordHash });
    db.$transaction.mockResolvedValue([]);
    const bearer = authorization(12, 'Student');

    const logout = await request(app).post('/api/v1/student/logout').set('Authorization', bearer);
    expect(logout.status).toBe(204);
    expect(db.revoked_sessions.upsert).toHaveBeenCalledOnce();

    db.revoked_sessions.findUnique.mockResolvedValue({ expires_at: new Date(Date.now() + 60_000) });
    const response = await request(app)
      .get('/api/v1/students/12/module-performance')
      .set('Authorization', bearer);
    expect(response.status).toBe(401);
  });

});
