export type SizeBucket = 'XS' | 'S' | 'M' | 'L' | 'XL';

/**
 * A pull request with the related rows needed to compute metrics.
 * Returned by the repository, consumed by the metrics functions/service.
 */
export interface PullRequestWithRelations {
  id: string;
  number: number;
  title: string;
  authorLogin: string;
  state: string;
  url: string | null;
  createdAt: Date;
  mergedAt: Date | null;
  closedAt: Date | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  reviews: { submittedAt: Date }[];
  reviewComments: { id: string }[];
}

export interface PullRequestMetrics {
  timeToFirstReviewHours: number | null;
  timeToMergeHours: number | null;
  reviewCount: number;
  commentCount: number;
  linesChanged: number;
  changedFiles: number;
  sizeBucket: SizeBucket;
  /** Comments per 100 lines changed; null when there are no line changes. */
  commentDensity: number | null;
}

export interface PullRequestSummary {
  id: string;
  number: number;
  title: string;
  authorLogin: string;
  state: string;
  url: string | null;
  createdAt: Date;
  mergedAt: Date | null;
  metrics: PullRequestMetrics;
}
