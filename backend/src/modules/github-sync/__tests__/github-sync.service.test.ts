import { GithubSyncService } from '../github-sync.service';
import { GithubClient } from '../github.client';
import { IGithubSyncRepository } from '../github-sync.repository';
import { PullRequestSyncData, RawRepository } from '../github-sync.types';

describe('GithubSyncService', () => {
  const org = 'acme';
  const repoName = 'widgets';

  const rawRepo: RawRepository = { id: 1, name: repoName, fullName: `${org}/${repoName}` };

  const pullRequestData: PullRequestSyncData = {
    pullRequest: {
      id: 100,
      number: 1,
      title: 'Add feature',
      authorLogin: 'alice',
      state: 'merged',
      url: 'https://github.com/acme/widgets/pull/1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      mergedAt: '2026-01-02T00:00:00Z',
      closedAt: '2026-01-02T00:00:00Z',
      additions: 10,
      deletions: 2,
      changedFiles: 3,
    },
    reviews: [{ id: 200, reviewerLogin: 'bob', state: 'APPROVED', submittedAt: '2026-01-01T12:00:00Z' }],
    reviewComments: [{ externalId: 'review:300', authorLogin: 'bob', createdAt: '2026-01-01T11:00:00Z' }],
    commits: [{ sha: 'abc123', authorLogin: 'alice', committedAt: '2026-01-01T01:00:00Z' }],
  };

  function createMocks() {
    const githubClient = {
      getRepository: jest.fn().mockResolvedValue(rawRepo),
      getRepositoryPullRequests: jest.fn().mockResolvedValue([pullRequestData]),
    } as unknown as jest.Mocked<GithubClient>;

    const repository: jest.Mocked<IGithubSyncRepository> = {
      upsertRepository: jest.fn().mockResolvedValue({ id: 'repo-id' }),
      upsertPullRequest: jest.fn().mockResolvedValue({ id: 'pr-id' }),
      replacePullRequestDetails: jest.fn().mockResolvedValue(undefined),
      upsertEngineers: jest.fn().mockResolvedValue(undefined),
    };

    return { githubClient, repository };
  }

  it('syncs a repository, upserting the repo, PR, details, and engineers', async () => {
    const { githubClient, repository } = createMocks();
    const service = new GithubSyncService(githubClient, repository, org);

    const result = await service.syncRepository(repoName);

    expect(githubClient.getRepository).toHaveBeenCalledWith(org, repoName);
    expect(githubClient.getRepositoryPullRequests).toHaveBeenCalledWith(org, repoName);

    expect(repository.upsertRepository).toHaveBeenCalledWith(rawRepo);
    expect(repository.upsertPullRequest).toHaveBeenCalledWith('repo-id', pullRequestData.pullRequest);
    expect(repository.replacePullRequestDetails).toHaveBeenCalledWith('pr-id', {
      reviews: pullRequestData.reviews,
      reviewComments: pullRequestData.reviewComments,
      commits: pullRequestData.commits,
    });

    expect(result).toEqual({ repository: `${org}/${repoName}`, pullRequestsSynced: 1 });
  });

  it('collects unique engineer usernames from authors, reviewers, commenters, and committers', async () => {
    const { githubClient, repository } = createMocks();
    const service = new GithubSyncService(githubClient, repository, org);

    await service.syncRepository(repoName);

    expect(repository.upsertEngineers).toHaveBeenCalledWith(
      expect.arrayContaining(['alice', 'bob']),
    );
    const usernames = repository.upsertEngineers.mock.calls[0][0];
    expect(usernames).toHaveLength(2);
  });

  it('syncAll syncs each repo and returns one result per repo', async () => {
    const { githubClient, repository } = createMocks();
    const service = new GithubSyncService(githubClient, repository, org);

    const results = await service.syncAll([repoName, 'other-repo']);

    expect(results).toHaveLength(2);
    expect(githubClient.getRepository).toHaveBeenCalledTimes(2);
  });
});
