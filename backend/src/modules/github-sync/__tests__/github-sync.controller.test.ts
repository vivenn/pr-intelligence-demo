import { NextFunction, Request, Response } from 'express';
import { ConflictError } from '../../../shared/errors/app-error';
import { GithubSyncController } from '../github-sync.controller';
import { GithubSyncService } from '../github-sync.service';
import { SyncStatusTracker } from '../sync-status';

function createResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('GithubSyncController', () => {
  const repos = ['widgets'];

  it('responds 202 immediately and runs the sync in the background', async () => {
    let resolveSync: (value: unknown) => void = () => undefined;
    const service = {
      syncAll: jest.fn().mockReturnValue(new Promise((resolve) => (resolveSync = resolve))),
    } as unknown as GithubSyncService;
    const tracker = new SyncStatusTracker();
    const controller = new GithubSyncController(service, repos, tracker);
    const res = createResponse();

    controller.triggerSync({} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(202);
    expect(tracker.isRunning()).toBe(true);

    resolveSync([{ repository: 'acme/widgets', pullRequestsSynced: 2 }]);
    await Promise.resolve();
    await Promise.resolve();

    expect(tracker.get().status).toBe('completed');
  });

  it('rejects a concurrent sync with a ConflictError', () => {
    const service = { syncAll: jest.fn().mockReturnValue(new Promise(() => undefined)) } as unknown as GithubSyncService;
    const tracker = new SyncStatusTracker();
    const controller = new GithubSyncController(service, repos, tracker);
    const next = jest.fn() as NextFunction;

    controller.triggerSync({} as Request, createResponse(), jest.fn()); // starts running
    controller.triggerSync({} as Request, createResponse(), next); // concurrent

    expect(next).toHaveBeenCalledWith(expect.any(ConflictError));
  });

  it('getStatus returns the current tracker state', () => {
    const service = { syncAll: jest.fn() } as unknown as GithubSyncService;
    const tracker = new SyncStatusTracker();
    const controller = new GithubSyncController(service, repos, tracker);
    const res = createResponse();

    controller.getStatus({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ data: tracker.get() });
  });
});
