import { PullRequestMetrics, PullRequestWithRelations, SizeBucket } from './pull-requests.types';

const MS_PER_HOUR = 1000 * 60 * 60;

function diffInHours(from: Date, to: Date): number {
  return Math.round(((to.getTime() - from.getTime()) / MS_PER_HOUR) * 100) / 100;
}

export function computeLinesChanged(pr: Pick<PullRequestWithRelations, 'additions' | 'deletions'>): number {
  return pr.additions + pr.deletions;
}

export function computeSizeBucket(linesChanged: number): SizeBucket {
  if (linesChanged < 10) return 'XS';
  if (linesChanged < 50) return 'S';
  if (linesChanged < 250) return 'M';
  if (linesChanged < 1000) return 'L';
  return 'XL';
}

export function computeTimeToFirstReviewHours(pr: PullRequestWithRelations): number | null {
  if (pr.reviews.length === 0) return null;

  const firstReviewAt = pr.reviews
    .map((review) => review.submittedAt)
    .reduce((earliest, current) => (current < earliest ? current : earliest));

  return diffInHours(pr.createdAt, firstReviewAt);
}

export function computeTimeToMergeHours(pr: PullRequestWithRelations): number | null {
  if (!pr.mergedAt) return null;
  return diffInHours(pr.createdAt, pr.mergedAt);
}

export function computeCommentDensity(commentCount: number, linesChanged: number): number | null {
  if (linesChanged === 0) return null;
  return Math.round((commentCount / linesChanged) * 100 * 100) / 100;
}

export function computePullRequestMetrics(pr: PullRequestWithRelations): PullRequestMetrics {
  const linesChanged = computeLinesChanged(pr);
  const commentCount = pr.reviewComments.length;

  return {
    timeToFirstReviewHours: computeTimeToFirstReviewHours(pr),
    timeToMergeHours: computeTimeToMergeHours(pr),
    reviewCount: pr.reviews.length,
    commentCount,
    linesChanged,
    changedFiles: pr.changedFiles,
    sizeBucket: computeSizeBucket(linesChanged),
    commentDensity: computeCommentDensity(commentCount, linesChanged),
  };
}
