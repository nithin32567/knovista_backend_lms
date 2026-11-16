import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Auth API Integration Tests', () => {
  it('GET /health should return 200 with service healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  describe('POST /api/v1/auth/student/login validation', () => {
    it('should return 422 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/student/login')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.email_or_username_or_mobile).toBeDefined();
      expect(res.body.errors.password).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/student/register validation', () => {
    it('should return 422 when registration body is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/student/register')
        .send({
          first_name: '',
          email: 'not-an-email',
          mobile_no: '123',
          password: 'short',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.first_name).toBeDefined();
      expect(res.body.errors.email).toBeDefined();
      expect(res.body.errors.mobile_no).toBeDefined();
      expect(res.body.errors.password).toBeDefined();
      expect(res.body.errors.gender).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/staff/login validation', () => {
    it('should return 422 when credentials are not provided', async () => {
      const res = await request(app)
        .post('/api/v1/auth/staff/login')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.email_or_username).toBeDefined();
      expect(res.body.errors.password).toBeDefined();
    });
  });

  describe('Protected Profile Routes', () => {
    it('GET /api/v1/auth/student/profile should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/student/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/staff/profile should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/staff/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

