import { computeRepositorySummary, computeThroughputByWeek, weekStart } from '../repositories.metrics';
import { RepositorySummarySource } from '../repositories.types';

describe('weekStart', () => {
  it('returns the Monday of the week for a mid-week date', () => {
    // 2026-01-01 is a Thursday; its week starts Monday 2025-12-29.
    expect(weekStart(new Date('2026-01-01T12:00:00Z'))).toBe('2025-12-29');
  });

  it('returns the same day for a Monday', () => {
    expect(weekStart(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });
});

describe('computeThroughputByWeek', () => {
  it('groups merged PRs by week and ignores unmerged ones', () => {
    const result = computeThroughputByWeek([
      { mergedAt: new Date('2026-01-05T00:00:00Z') }, // week 2026-01-05
      { mergedAt: new Date('2026-01-07T00:00:00Z') }, // same week
      { mergedAt: new Date('2026-01-12T00:00:00Z') }, // week 2026-01-12
      { mergedAt: null }, // ignored
    ]);

    expect(result).toEqual([
      { week: '2026-01-05', merged: 2 },
      { week: '2026-01-12', merged: 1 },
    ]);
  });
});

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
      throughputByWeek: [],
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
      throughputByWeek: [{ week: '2025-12-29', merged: 2 }], // both merged in the same week
    });
  });
});
