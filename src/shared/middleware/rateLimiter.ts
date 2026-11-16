import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/response';

export function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      sendError(res, message, 429, 'RATE_LIMIT_EXCEEDED');
    },
  });
}

export const authRateLimiter = createRateLimiter(
  60 * 1000,
  10,
  'Too many authentication attempts. Please try again after 1 minute.'
);

export const standardApiLimiter = createRateLimiter(
  60 * 1000,
  200,
  'Too many requests. Please slow down.'
);

