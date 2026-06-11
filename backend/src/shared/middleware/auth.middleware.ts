import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/app-error';

/**
 * Returns an API-key auth guard. When no key is configured, auth is disabled (pass-through)
 * so local dev and the demo work without friction. When a key is set, every request must
 * present a matching `X-API-Key` header. Engineer-level data is sensitive, so production
 * deployments are expected to configure a key.
 */
export function apiKeyAuth(requiredKey?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!requiredKey) {
      next();
      return;
    }

    if (req.header('x-api-key') !== requiredKey) {
      next(new UnauthorizedError('Invalid or missing API key'));
      return;
    }

    next();
  };
}
