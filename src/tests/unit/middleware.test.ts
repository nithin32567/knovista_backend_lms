import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { requireRole } from '../../shared/middleware/requireRole';
import { authenticate } from '../../shared/middleware/authenticate';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';

describe('Middleware Unit Tests', () => {
  describe('validateRequest', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    it('should call next when request body matches schema', async () => {
      const req = {
        body: { email: 'valid@example.com', age: 25 },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = validateRequest(testSchema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should forward ZodError to next when body fails validation', async () => {
      const req = {
        body: { email: 'not-an-email', age: 10 },
      } as unknown as Request;
      const res = {} as Response;
      const nextMock = vi.fn();
      const next = nextMock as unknown as NextFunction;

      const middleware = validateRequest(testSchema);
      await middleware(req, res, next);

      expect(nextMock).toHaveBeenCalled();
      const firstCallArgs = nextMock.mock.calls[0];
      const error = firstCallArgs ? firstCallArgs[0] : undefined;
      expect(error).toBeInstanceOf(z.ZodError);
    });
  });

  describe('requireRole', () => {
    it('should forward UnauthorizedError if req.user is undefined', () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = requireRole(['Admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should forward ForbiddenError if user is not institution_user', () => {
      const req = {
        user: { id: 1, type: 'student', entity: {} },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = requireRole(['Admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should forward ForbiddenError if staff user role is not allowed', () => {
      const req = {
        user: { id: 1, type: 'institution_user', role: 'Tutor', entity: {} },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = requireRole(['Admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next if staff user role is allowed', () => {
      const req = {
        user: { id: 1, type: 'institution_user', role: 'Admin', entity: {} },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = requireRole(['Admin', 'Tutor']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authenticate', () => {
    it('should reject request missing Authorization header', async () => {
      const req = { headers: {} } as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = authenticate('student');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject malformed Bearer token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid.token.value' },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as unknown as NextFunction;

      const middleware = authenticate('student');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
