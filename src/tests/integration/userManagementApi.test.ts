import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { env } from '../../config/env';

describe('Admin User Management & Dashboard Integration Tests', () => {
  const adminToken = jwt.sign(
    { sub: 1, prv: 'App\\Models\\InstitutionUser', role: 'Admin' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  describe('Dashboard Endpoints', () => {
    it('GET /api/dashboard/admin without token should return 401', async () => {
      const res = await request(app).get('/api/dashboard/admin');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/dashboard/admin with admin token should return 200 with real DB counts', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.total_students).toBe('number');
      expect(typeof res.body.data.total_users).toBe('number');
      expect(typeof res.body.data.active_students).toBe('number');
      expect(typeof res.body.data.total_batches).toBe('number');
    });

    it('GET /api/v1/dashboard/admin with admin token should return 200', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Students Endpoints', () => {
    it('GET /api/v1/students without token should return 401', async () => {
      const res = await request(app).get('/api/v1/students');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/students with admin token should return 200 with paginated students', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.current_page).toBe(1);
    });

    it('POST /api/v1/student/register should return 422 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/student/register')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/students/reset-password should return 422 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/students/reset-password')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/students/reset-password should return 422 when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/students/reset-password')
        .send({
          student_id: 1,
          new_password: 'password123',
          confirm_password: 'password999',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors?.confirm_password).toBeDefined();
    });
  });

  describe('Institution Users & Roles Endpoints', () => {
    it('GET /api/v1/institution-users without token should return 401', async () => {
      const res = await request(app).get('/api/v1/institution-users');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/institution-users with admin token should return 200 with staff list', async () => {
      const res = await request(app)
        .get('/api/v1/institution-users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/institution-roles/active without token should return 401', async () => {
      const res = await request(app).get('/api/v1/institution-roles/active');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/institution-roles/active with admin token should return 200 with active roles', async () => {
      const res = await request(app)
        .get('/api/v1/institution-roles/active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/institution-users without token should return 401', async () => {
      const res = await request(app).post('/api/v1/institution-users').send({});
      expect(res.status).toBe(401);
    });

    it('POST /api/v1/institution-users with admin token but invalid body should return 422', async () => {
      const res = await request(app)
        .post('/api/v1/institution-users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});

