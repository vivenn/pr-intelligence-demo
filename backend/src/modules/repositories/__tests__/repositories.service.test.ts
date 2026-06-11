import { NotFoundError } from '../../../shared/errors/app-error';
import { IRepositoryRepository } from '../repositories.repository';
import { RepositoryService } from '../repositories.service';

describe('RepositoryService', () => {
  function createRepository(): jest.Mocked<IRepositoryRepository> {
    return {
      list: jest.fn(),
      findById: jest.fn(),
      getSummarySource: jest.fn(),
    };
  }

  describe('listRepositories', () => {
    it('delegates to the repository', async () => {
      const repository = createRepository();
      repository.list.mockResolvedValue({
        items: [{ id: 'r1', name: 'widgets', fullName: 'acme/widgets' }],
        total: 1,
      });
      const service = new RepositoryService(repository);

      const result = await service.listRepositories({ page: 1, pageSize: 20 });

      expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result.total).toBe(1);
    });
  });

  describe('getRepositorySummary', () => {
    it('returns the profile with computed summary metrics', async () => {
      const repository = createRepository();
      repository.findById.mockResolvedValue({ id: 'r1', name: 'widgets', fullName: 'acme/widgets' });
      repository.getSummarySource.mockResolvedValue({
        pullRequests: [
          {
            state: 'merged',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            mergedAt: new Date('2026-01-01T10:00:00Z'),
            additions: 20,
            deletions: 0,
          },
        ],
        reviewCount: 2,
        commentCount: 5,
      });
      const service = new RepositoryService(repository);

      const result = await service.getRepositorySummary('r1');

      expect(result.fullName).toBe('acme/widgets');
      expect(result.metrics.mergedPullRequests).toBe(1);
      expect(result.metrics.avgCycleTimeHours).toBe(10);
      expect(result.metrics.totalComments).toBe(5);
    });

    it('throws NotFoundError when the repository does not exist', async () => {
      const repository = createRepository();
      repository.findById.mockResolvedValue(null);
      const service = new RepositoryService(repository);

      await expect(service.getRepositorySummary('missing')).rejects.toBeInstanceOf(NotFoundError);
      expect(repository.getSummarySource).not.toHaveBeenCalled();
    });
  });
});
