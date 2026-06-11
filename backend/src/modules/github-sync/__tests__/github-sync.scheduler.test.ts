import cron from 'node-cron';
import { startSyncScheduler } from '../github-sync.scheduler';
import { GithubSyncService } from '../github-sync.service';

jest.mock('node-cron');

const mockedCron = cron as jest.Mocked<typeof cron>;

describe('startSyncScheduler', () => {
  const repos = ['widgets'];
  const silentLogger = { log: jest.fn(), error: jest.fn() };

  function createService(): jest.Mocked<Pick<GithubSyncService, 'syncAll'>> {
    return { syncAll: jest.fn().mockResolvedValue([{ repository: 'acme/widgets', pullRequestsSynced: 3 }]) };
  }

  beforeEach(() => {
    mockedCron.validate.mockReturnValue(true);
    mockedCron.schedule.mockReturnValue({ stop: jest.fn() } as unknown as ReturnType<typeof cron.schedule>);
  });

  it('throws on an invalid cron expression', () => {
    mockedCron.validate.mockReturnValue(false);
    const service = createService() as unknown as GithubSyncService;

    expect(() => startSyncScheduler(service, repos, 'not-a-cron', silentLogger)).toThrow(/Invalid SYNC_CRON/);
  });

  it('registers a scheduled task with the given expression', () => {
    const service = createService() as unknown as GithubSyncService;

    startSyncScheduler(service, repos, '*/30 * * * *', silentLogger);

    expect(mockedCron.schedule).toHaveBeenCalledWith('*/30 * * * *', expect.any(Function));
  });

  it('runs the sync when the scheduled task fires', async () => {
    const service = createService();
    startSyncScheduler(service as unknown as GithubSyncService, repos, '*/30 * * * *', silentLogger);

    // Invoke the callback node-cron would have called on tick.
    const tick = mockedCron.schedule.mock.calls[0][1] as () => Promise<void>;
    await tick();

    expect(service.syncAll).toHaveBeenCalledWith(repos);
  });
});
