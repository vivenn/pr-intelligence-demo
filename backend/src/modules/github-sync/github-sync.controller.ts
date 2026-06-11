import { NextFunction, Request, Response } from 'express';
import { ConflictError } from '../../shared/errors/app-error';
import { GithubSyncService } from './github-sync.service';
import { SyncStatusTracker } from './sync-status';

export class GithubSyncController {
  constructor(
    private readonly service: GithubSyncService,
    private readonly repos: string[],
    private readonly tracker: SyncStatusTracker = new SyncStatusTracker(),
  ) {}

  triggerSync = (_req: Request, res: Response, next: NextFunction): void => {
    if (this.tracker.isRunning()) {
      next(new ConflictError('A sync is already in progress'));
      return;
    }

    this.tracker.start();
    // Respond immediately; run the sync in the background so the request never blocks.
    res.status(202).json({ data: { status: 'running' } });

    this.service
      .syncAll(this.repos)
      .then((result) => this.tracker.complete(result))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Sync failed';
        console.error('Background sync failed:', err);
        this.tracker.fail(message);
      });
  };

  getStatus = (_req: Request, res: Response): void => {
    res.json({ data: this.tracker.get() });
  };
}
