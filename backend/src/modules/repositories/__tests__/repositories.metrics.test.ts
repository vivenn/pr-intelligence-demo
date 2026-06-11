import { computeRepositorySummary } from '../repositories.metrics';
import { RepositorySummarySource } from '../repositories.types';

describe('computeRepositorySummary', () => {
  it('returns zeroed/null metrics for an empty repository', () => {
    const source: RepositorySummarySource = { pullRequests: [], reviewCount: 0, commentCount: 0 };

    expect(computeRepositorySummary(source)).toEqual({
      totalPullRequests: 0,
      mergedPullRequests: 0,
      openPullRequests: 0,
      avgCycleTimeHours: null,
      avgPullRequestSize: null,
      totalReviews: 0,
      totalComments: 0,
    });
  });

  it('aggregates counts, cycle time, and size across pull requests', () => {
    const source: RepositorySummarySource = {
      pullRequests: [
        {
          state: 'merged',
          createdAt: new Date('2026-01-01T00:00:00Z'),
          mergedAt: new Date('2026-01-01T10:00:00Z'),
          additions: 30,
          deletions: 10,
        },
        {
          state: 'merged',
          createdAt: new Date('2026-01-02T00:00:00Z'),
          mergedAt: new Date('2026-01-02T20:00:00Z'),
          additions: 50,
          deletions: 10,
        },
        {
          state: 'open',
          createdAt: new Date('2026-01-03T00:00:00Z'),
          mergedAt: null,
          additions: 20,
          deletions: 0,
        },
      ],
      reviewCount: 8,
      commentCount: 15,
    };

    expect(computeRepositorySummary(source)).toEqual({
      totalPullRequests: 3,
      mergedPullRequests: 2,
      openPullRequests: 1,
      avgCycleTimeHours: 15, // (10 + 20) / 2
      avgPullRequestSize: 40, // (40 + 60 + 20) / 3
      totalReviews: 8,
      totalComments: 15,
    });
  });
});
