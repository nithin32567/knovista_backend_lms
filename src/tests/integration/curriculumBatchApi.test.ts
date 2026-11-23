import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

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

