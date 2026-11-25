import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { env } from '../../config/env';

describe('Student Dashboard, Notifications, Quotes, Leave Reasons & Performance Integration Tests', () => {
  const studentToken = jwt.sign(
    { sub: 4, prv: 'App\\Models\\Student' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const otherStudentToken = jwt.sign(
    { sub: 1, prv: 'App\\Models\\Student' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { sub: 1, prv: 'App\\Models\\InstitutionUser', role: 'Admin' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('GET /api/student/notifications?student_id=4 with student token returns 200 and expected shape', async () => {
    const res = await request(app)
      .get('/api/student/notifications?student_id=4')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(typeof res.body.data.new_count).toBe('number');
  });

  it('GET /api/student/notifications?student_id=4 with mismatched student token returns 403', async () => {
    const res = await request(app)
      .get('/api/student/notifications?student_id=4')
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/student/notifications/mark-viewed with student token returns 200 with updated_count', async () => {
    const res = await request(app)
      .post('/api/student/notifications/mark-viewed')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ student_id: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.updated_count).toBe('number');
  });

  it('GET /api/student/dashboard?student_id=4 with student token returns 200 and expected dashboard shape', async () => {
    const res = await request(app)
      .get('/api/student/dashboard?student_id=4')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.overall_progress).toBe('number');
    expect(typeof res.body.data.total_leave_taken).toBe('number');
    expect(typeof res.body.data.placement_percentage).toBe('number');
    expect(typeof res.body.data.todays_quote).toBe('string');
    expect(typeof res.body.data.information_message).toBe('string');
  });

  it('GET /api/student/dashboard?student_id=4 with admin token returns 200', async () => {
    const res = await request(app)
      .get('/api/student/dashboard?student_id=4')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/daily-quotes with student token returns 200 and array', async () => {
    const res = await request(app)
      .get('/api/daily-quotes')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/leave-reasons with student token returns 200 and array', async () => {
    const res = await request(app)
      .get('/api/leave-reasons')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/students/4/module-performance returns 200 without column error', async () => {
    const res = await request(app)
      .get('/api/students/4/module-performance')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.student).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/students/login-status with student token and login_type returns 200', async () => {
    const res = await request(app)
      .post('/api/students/login-status')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ student_id: 4, login_type: 'login' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
