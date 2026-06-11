import { NotFoundError } from '../../../shared/errors/app-error';
import { IPullRequestRepository } from '../pull-requests.repository';
import { PullRequestService } from '../pull-requests.service';
import { PullRequestWithRelations } from '../pull-requests.types';

function buildPullRequest(overrides: Partial<PullRequestWithRelations> = {}): PullRequestWithRelations {
  return {
    id: 'pr-1',
    number: 1,
    title: 'Add feature',
    authorLogin: 'alice',
    state: 'merged',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    mergedAt: new Date('2026-01-01T12:00:00Z'),
    closedAt: new Date('2026-01-01T12:00:00Z'),
    additions: 30,
    deletions: 20,
    changedFiles: 4,
    reviews: [{ submittedAt: new Date('2026-01-01T03:00:00Z') }],
    reviewComments: [{ id: 'c1' }],
    ...overrides,
  };
}

describe('PullRequestService', () => {
  function createRepository(): jest.Mocked<IPullRequestRepository> {
    return {
      list: jest.fn(),
      findById: jest.fn(),
    };
  }

  describe('listPullRequests', () => {
    it('returns summaries with computed metrics and total', async () => {
      const repository = createRepository();
      repository.list.mockResolvedValue({ items: [buildPullRequest()], total: 1 });
      const service = new PullRequestService(repository);

      const result = await service.listPullRequests({}, { page: 1, pageSize: 20 });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'pr-1',
        number: 1,
        authorLogin: 'alice',
      });
      expect(result.items[0].metrics.timeToMergeHours).toBe(12);
      expect(result.items[0].metrics.sizeBucket).toBe('M');
    });

    it('passes filter and pagination through to the repository', async () => {
      const repository = createRepository();
      repository.list.mockResolvedValue({ items: [], total: 0 });
      const service = new PullRequestService(repository);

      await service.listPullRequests({ authorLogin: 'bob' }, { page: 2, pageSize: 10 });

      expect(repository.list).toHaveBeenCalledWith({ authorLogin: 'bob' }, { page: 2, pageSize: 10 });
    });
  });

  describe('getPullRequest', () => {
    it('returns a summary with metrics when found', async () => {
      const repository = createRepository();
      repository.findById.mockResolvedValue(buildPullRequest());
      const service = new PullRequestService(repository);

      const result = await service.getPullRequest('pr-1');

      expect(result.id).toBe('pr-1');
      expect(result.metrics.reviewCount).toBe(1);
    });

    it('throws NotFoundError when the PR does not exist', async () => {
      const repository = createRepository();
      repository.findById.mockResolvedValue(null);
      const service = new PullRequestService(repository);

      await expect(service.getPullRequest('missing')).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
