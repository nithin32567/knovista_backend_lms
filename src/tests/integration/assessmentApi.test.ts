import { beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { passwordSessionProof } from '../../shared/utils/sessionTokens';
import { PrismaAssessmentRepository } from '../../modules/assessment/infrastructure/persistence/PrismaAssessmentRepository';

const db = vi.hoisted(() => ({
  revoked_sessions: { findUnique: vi.fn() },
  students: { findUnique: vi.fn() },
  topics: { findFirst: vi.fn() },
  topic_assessments: { findUnique: vi.fn() },
}));

vi.mock('../../config/database', () => ({ prisma: db }));

const passwordHash = 'assessment-test-password-version';

function studentAuthorization(): string {
  const token = jwt.sign(
    { sub: 7, prv: 'App\\Models\\Student', pwd: passwordSessionProof(passwordHash, env.JWT_SECRET) },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return `Bearer ${token}`;
}

beforeEach(() => {
  vi.resetAllMocks();
  db.revoked_sessions.findUnique.mockResolvedValue(null);
  db.students.findUnique.mockResolvedValue({ id: 7n, status: 'Active', password: passwordHash });
});

describe('Assessment and MCQ Engine API Integration Tests', () => {
  it('POST /api/v1/student-sections/assessment-answers should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/student-sections/assessment-answers')
      .send({
        answers: [
          {
            student_id: 1,
            student_topic_id: 2,
            topic_id: 3,
            assessment_id: 4,
            answer: 'Option A',
          },
        ],
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/student-sections/assessment-answers should validate required body fields with 422', async () => {
    const res = await request(app)
      .post('/api/student-sections/assessment-answers')
      .send({});

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/student/assessment-answers should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .get('/api/v1/student/assessment-answers')
      .query({ student_id: 1, topic_id: 2 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/topics/:id/assessments should reject unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/v1/topics/10/assessments');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/topics/:id/assessments should reject non-numeric topic id with 422 when invalid', async () => {
    const res = await request(app).get('/api/v1/topics/abc/assessments');

    expect(res.status).toBe(401);
  });
});


describe('Student assessment access', () => {
  it('requires an enrollment linked to an unlocked or completed module owned by the signed-in student', async () => {
    db.topics.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/topics/10/assessments').set('Authorization', studentAuthorization());
    expect(res.status).toBe(404);
    expect(db.topics.findFirst.mock.calls[0]?.[0].where).toMatchObject({
      id: 10n,
      student_section_module_topics: {
        some: {
          student_id: 7n,
          student_section_module: {
            status: { in: expect.arrayContaining(['Unlocked', 'completed']) },
            student_section: { student_id: 7n },
          },
        },
      },
    });
    expect(db.topics.findFirst.mock.calls[0]?.[0].where.student_section_module_topics.some.student_section_module.status.in)
      .not.toContain('Locked');
  });

  it('returns assessment questions without answer keys when access is granted', async () => {
    db.topics.findFirst.mockResolvedValue({
      topic_assessments: [{ id: 4n, topic_id: 10n, question: 'Pick A', options: { Option1: 'A' },
        answer: { Answer1: 'A' }, correct_answer: 'A', marks: 1, priority: 1, status: 'Active', created_at: null, updated_at: null }],
    });
    const res = await request(app).get('/api/topics/10/assessments').set('Authorization', studentAuthorization());
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject([{ id: 4, question: 'Pick A' }]);
    for (const key of ['answer', 'correct_answer', 'marks']) {
      expect(res.body.data[0]).not.toHaveProperty(key);
    }
  });

  it('reads the legacy answer value for server-side grading', async () => {
    db.topic_assessments.findUnique.mockResolvedValue({
      id: 4n, topic_id: 10n, question: 'Pick A', options: { Option1: 'A' }, answer: { Answer1: 'A' },
      correct_answer: null, marks: 1, priority: 1, status: 'Active', created_at: null, updated_at: null,
    });
    const assessment = await new PrismaAssessmentRepository().findAssessmentById(4);
    expect(assessment?.correctAnswer).toBe('A');
  });
});
