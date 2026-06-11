/** Raw per-repository data fetched by the repository, fed into the summary function. */
export interface RepositorySummarySource {
  pullRequests: {
    state: string;
    createdAt: Date;
    mergedAt: Date | null;
    additions: number;
    deletions: number;
  }[];
  reviewCount: number;
  commentCount: number;
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

export interface RepositoryProfile {
  id: string;
  name: string;
  fullName: string;
}

export interface RepositorySummary extends RepositoryProfile {
  metrics: RepositorySummaryMetrics;
}
