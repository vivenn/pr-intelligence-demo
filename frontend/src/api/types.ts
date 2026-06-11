// Types mirroring the backend API DTOs.

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
}

export interface ApiItem<T> {
  data: T;
}

export type SizeBucket = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface PullRequestMetrics {
  timeToFirstReviewHours: number | null;
  timeToMergeHours: number | null;
  reviewCount: number;
  commentCount: number;
  linesChanged: number;
  changedFiles: number;
  sizeBucket: SizeBucket;
  commentDensity: number | null;
}

export interface PullRequestSummary {
  id: string;
  number: number;
  title: string;
  authorLogin: string;
  state: string;
  createdAt: string;
  mergedAt: string | null;
  metrics: PullRequestMetrics;
}

export interface EngineerProfile {
  id: string;
  username: string;
  displayName: string | null;
}

export interface EngineerMetrics {
  totalPullRequests: number;
  mergedPullRequests: number;
  avgCycleTimeHours: number | null;
  medianCycleTimeHours: number | null;
  avgPullRequestSize: number | null;
  reviewLoadGiven: number;
  reviewLoadReceived: number;
}

export interface EngineerWithMetrics extends EngineerProfile {
  metrics: EngineerMetrics;
}

export interface RepositoryProfile {
  id: string;
  name: string;
  fullName: string;
}

export interface RepositorySummaryMetrics {
  totalPullRequests: number;
  mergedPullRequests: number;
  openPullRequests: number;
  avgCycleTimeHours: number | null;
  avgPullRequestSize: number | null;
  totalReviews: number;
  totalComments: number;
}

export interface RepositorySummary extends RepositoryProfile {
  metrics: RepositorySummaryMetrics;
}

export interface SyncResult {
  repository: string;
  pullRequestsSynced: number;
}
