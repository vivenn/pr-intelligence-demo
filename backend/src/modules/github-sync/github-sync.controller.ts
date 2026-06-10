import { NextFunction, Request, Response } from 'express';
import { GithubSyncService } from './github-sync.service';

export class GithubSyncController {
  constructor(
    private readonly service: GithubSyncService,
    private readonly repos: string[],
  ) {}

  triggerSync = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.syncAll(this.repos);
      res.json({ data: results });
    } catch (err) {
      next(err);
    }
  };
}
