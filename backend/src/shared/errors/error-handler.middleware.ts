import { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    });
    return;
  }

  // Log full detail server-side only; never leak internal messages, stack traces,
  // or DB errors to the client.
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
  });
}
