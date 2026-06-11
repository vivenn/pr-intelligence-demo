import { NotFoundError } from '../../../shared/errors/app-error';
import { IEngineerRepository } from '../engineers.repository';
import { EngineerService } from '../engineers.service';

describe('EngineerService', () => {
  function createRepository(): jest.Mocked<IEngineerRepository> {
    return {
      list: jest.fn(),
      findByUsername: jest.fn(),
      getMetricsSource: jest.fn(),
    };
  }

  describe('listEngineers', () => {
    it('delegates to the repository', async () => {
      const repository = createRepository();
      repository.list.mockResolvedValue({ items: [{ id: '1', username: 'alice', displayName: null }], total: 1 });
      const service = new EngineerService(repository);

      const result = await service.listEngineers({ page: 1, pageSize: 20 });

      expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result.total).toBe(1);
    });
  });

  describe('getEngineer', () => {
    it('returns the profile with computed metrics', async () => {
      const repository = createRepository();
      repository.findByUsername.mockResolvedValue({ id: '1', username: 'alice', displayName: 'Alice' });
      repository.getMetricsSource.mockResolvedValue({
        authoredPullRequests: [
          {
            createdAt: new Date('2026-01-01T00:00:00Z'),
            mergedAt: new Date('2026-01-01T10:00:00Z'),
            additions: 20,
            deletions: 0,
          },
        ],
        reviewsGivenCount: 3,
        reviewsReceivedCount: 1,
      });
      const service = new EngineerService(repository);

      const result = await service.getEngineer('alice');

      expect(result.username).toBe('alice');
      expect(result.metrics.mergedPullRequests).toBe(1);
      expect(result.metrics.avgCycleTimeHours).toBe(10);
      expect(result.metrics.reviewLoadGiven).toBe(3);
    });

    it('throws NotFoundError when the engineer does not exist', async () => {
      const repository = createRepository();
      repository.findByUsername.mockResolvedValue(null);
      const service = new EngineerService(repository);

      await expect(service.getEngineer('ghost')).rejects.toBeInstanceOf(NotFoundError);
      expect(repository.getMetricsSource).not.toHaveBeenCalled();
    });
  });
});
