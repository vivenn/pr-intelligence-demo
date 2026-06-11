import {
  computeCommentDensity,
  computeLinesChanged,
  computePullRequestMetrics,
  computeSizeBucket,
  computeTimeToFirstReviewHours,
  computeTimeToMergeHours,
} from '../pull-requests.metrics';
import { PullRequestWithRelations } from '../pull-requests.types';

function buildPullRequest(overrides: Partial<PullRequestWithRelations> = {}): PullRequestWithRelations {
  return {
    id: 'pr-1',
    number: 1,
    title: 'Add feature',
    authorLogin: 'alice',
    state: 'merged',
    url: 'https://github.com/acme/widgets/pull/1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    mergedAt: new Date('2026-01-02T00:00:00Z'),
    closedAt: new Date('2026-01-02T00:00:00Z'),
    additions: 30,
    deletions: 20,
    changedFiles: 4,
    reviews: [],
    reviewComments: [],
    ...overrides,
  };
}

describe('computeLinesChanged', () => {
  it('sums additions and deletions', () => {
    expect(computeLinesChanged({ additions: 30, deletions: 20 })).toBe(50);
  });
});

describe('computeSizeBucket', () => {
  it.each([
    [0, 'XS'],
    [9, 'XS'],
    [10, 'S'],
    [49, 'S'],
    [50, 'M'],
    [249, 'M'],
    [250, 'L'],
    [999, 'L'],
    [1000, 'XL'],
    [5000, 'XL'],
  ])('maps %i lines changed to bucket %s', (lines, expected) => {
    expect(computeSizeBucket(lines)).toBe(expected);
  });
});

describe('computeTimeToFirstReviewHours', () => {
  it('returns null when there are no reviews', () => {
    expect(computeTimeToFirstReviewHours(buildPullRequest({ reviews: [] }))).toBeNull();
  });

  it('uses the earliest peer review submission time', () => {
    const pr = buildPullRequest({
      authorLogin: 'alice',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      reviews: [
        { submittedAt: new Date('2026-01-01T10:00:00Z'), reviewerLogin: 'bob' },
        { submittedAt: new Date('2026-01-01T04:00:00Z'), reviewerLogin: 'carol' },
      ],
    });

    expect(computeTimeToFirstReviewHours(pr)).toBe(4);
  });

  it('ignores the author self-reviewing their own PR', () => {
    const pr = buildPullRequest({
      authorLogin: 'alice',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      reviews: [
        { submittedAt: new Date('2026-01-01T02:00:00Z'), reviewerLogin: 'alice' }, // self-review
        { submittedAt: new Date('2026-01-01T05:00:00Z'), reviewerLogin: 'bob' }, // peer
      ],
    });

    // First *peer* review is bob's at +5h, not alice's self-review at +2h.
    expect(computeTimeToFirstReviewHours(pr)).toBe(5);
  });

  it('returns null when the only review is a self-review', () => {
    const pr = buildPullRequest({
      authorLogin: 'alice',
      reviews: [{ submittedAt: new Date('2026-01-01T02:00:00Z'), reviewerLogin: 'alice' }],
    });

    expect(computeTimeToFirstReviewHours(pr)).toBeNull();
  });
});

describe('computeTimeToMergeHours', () => {
  it('returns null when the PR is not merged', () => {
    expect(computeTimeToMergeHours(buildPullRequest({ mergedAt: null }))).toBeNull();
  });

  it('computes hours between creation and merge', () => {
    const pr = buildPullRequest({
      createdAt: new Date('2026-01-01T00:00:00Z'),
      mergedAt: new Date('2026-01-02T00:00:00Z'),
    });

    expect(computeTimeToMergeHours(pr)).toBe(24);
  });
});

describe('computeCommentDensity', () => {
  it('returns null when no lines changed', () => {
    expect(computeCommentDensity(3, 0)).toBeNull();
  });

  it('computes comments per 100 lines', () => {
    expect(computeCommentDensity(5, 50)).toBe(10);
  });
});

describe('computePullRequestMetrics', () => {
  it('aggregates all metrics for a pull request', () => {
    const pr = buildPullRequest({
      createdAt: new Date('2026-01-01T00:00:00Z'),
      mergedAt: new Date('2026-01-01T12:00:00Z'),
      additions: 60,
      deletions: 40,
      changedFiles: 5,
      reviews: [{ submittedAt: new Date('2026-01-01T03:00:00Z'), reviewerLogin: 'bob' }],
      reviewComments: [{ id: 'c1' }, { id: 'c2' }],
    });

    expect(computePullRequestMetrics(pr)).toEqual({
      timeToFirstReviewHours: 3,
      timeToMergeHours: 12,
      reviewCount: 1,
      commentCount: 2,
      linesChanged: 100,
      changedFiles: 5,
      sizeBucket: 'M',
      commentDensity: 2,
    });
  });
});
