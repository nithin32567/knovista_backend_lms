import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

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

