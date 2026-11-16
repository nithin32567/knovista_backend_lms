import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200
): Response<ApiResponse<T>> {
  const payload: ApiResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message = 'Internal Server Error',
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  errors?: Record<string, string[]>
): Response<ApiResponse> {
  const payload: ApiResponse = {
    success: false,
    message,
    errorCode,
  };

  if (errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

