import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Progress and Evaluation API Integration Tests', () => {
  it('POST /api/v1/student-section-topics/complete should reject unauthorized requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/student-section-topics/complete')
      .send({ student_topic_id: 1 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/student-sections/request-unlock-next-module should validate required fields with 422', async () => {
    const res = await request(app)
      .post('/api/v1/student-sections/request-unlock-next-module')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
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
});
