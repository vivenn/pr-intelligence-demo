import cron, { ScheduledTask } from 'node-cron';
import { GithubSyncService } from './github-sync.service';

/**
 * Starts a scheduled sync on the given cron expression. Runs are sequential-safe:
 * if a sync is still running when the next tick fires, the tick is skipped.
 * Returns the scheduled task so callers can stop it (e.g. on shutdown).
 */
export function startSyncScheduler(
  service: GithubSyncService,
  repos: string[],
  cronExpression: string,
  logger: Pick<Console, 'log' | 'error'> = console,
): ScheduledTask {
  if (!cron.validate(cronExpression)) {
    throw new Error(`Invalid SYNC_CRON expression: ${cronExpression}`);
  }

  let running = false;

  const task = cron.schedule(cronExpression, async () => {
    if (running) {
      logger.log('[sync-scheduler] previous sync still running, skipping this tick');
      return;
    }

    running = true;
    try {
      const results = await service.syncAll(repos);
      const total = results.reduce((sum, r) => sum + r.pullRequestsSynced, 0);
      logger.log(`[sync-scheduler] synced ${results.length} repo(s), ${total} pull request(s)`);
    } catch (err) {
      logger.error(`[sync-scheduler] sync failed: ${(err as Error).message}`);
    } finally {
      running = false;
    }
  });

  logger.log(`[sync-scheduler] scheduled sync with cron "${cronExpression}"`);
  return task;
}
