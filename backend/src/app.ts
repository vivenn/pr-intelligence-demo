import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { errorHandler } from './shared/errors/error-handler.middleware';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ data: { status: 'ok' } });
  });

  app.use(errorHandler);

  return app;
}
