import { computeEngineerMetrics, cycleTimeHours } from '../engineers.metrics';
import { EngineerMetricsSource } from '../engineers.types';

describe('cycleTimeHours', () => {
  it('computes hours between creation and merge', () => {
    expect(cycleTimeHours(new Date('2026-01-01T00:00:00Z'), new Date('2026-01-02T06:00:00Z'))).toBe(30);
  });
});

describe('computeEngineerMetrics', () => {
  it('returns zeroed/null metrics when there is no activity', () => {
    const source: EngineerMetricsSource = {
      authoredPullRequests: [],
      reviewsGivenCount: 0,
      reviewsReceivedCount: 0,
    };

    expect(computeEngineerMetrics(source)).toEqual({
      totalPullRequests: 0,
      mergedPullRequests: 0,
      avgCycleTimeHours: null,
      medianCycleTimeHours: null,
      avgPullRequestSize: null,
      reviewLoadGiven: 0,
      reviewLoadReceived: 0,
    });
  });

  it('aggregates cycle time over merged PRs and size over all PRs', () => {
    const source: EngineerMetricsSource = {
      authoredPullRequests: [
        {
          createdAt: new Date('2026-01-01T00:00:00Z'),
          mergedAt: new Date('2026-01-01T10:00:00Z'),
          additions: 30,
          deletions: 10,
        },
        {
          createdAt: new Date('2026-01-02T00:00:00Z'),
          mergedAt: new Date('2026-01-02T20:00:00Z'),
          additions: 50,
          deletions: 10,
        },
        // open PR: counts toward size and total, not cycle time
        {
          createdAt: new Date('2026-01-03T00:00:00Z'),
          mergedAt: null,
          additions: 100,
          deletions: 0,
        },
      ],
      reviewsGivenCount: 7,
      reviewsReceivedCount: 4,
    };

    expect(computeEngineerMetrics(source)).toEqual({
      totalPullRequests: 3,
      mergedPullRequests: 2,
      avgCycleTimeHours: 15, // (10 + 20) / 2
      medianCycleTimeHours: 15,
      avgPullRequestSize: 66.67, // (40 + 60 + 100) / 3
      reviewLoadGiven: 7,
      reviewLoadReceived: 4,
    });
  });
});
