import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ValidationError } from '../errors/ValidationError';
import { sendError } from '../utils/response';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof ValidationError) {
    return sendError(res, err.message, err.statusCode, err.errorCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'general';
      const existing = formattedErrors[field];
      if (existing) {
        existing.push(issue.message);
      } else {
        formattedErrors[field] = [issue.message];
      }
    }
    return sendError(res, 'The given data was invalid.', 422, 'VALIDATION_ERROR', formattedErrors);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode);
  }

  const fallbackMessage = err instanceof Error ? err.message : 'Internal Server Error';
  return sendError(res, fallbackMessage, 500, 'INTERNAL_SERVER_ERROR');
}

