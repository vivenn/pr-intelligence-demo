/** Raw per-engineer data fetched by the repository and fed into the metric functions. */
export interface EngineerMetricsSource {
  authoredPullRequests: {
    createdAt: Date;
    mergedAt: Date | null;
    additions: number;
    deletions: number;
  }[];
  /** Reviews this engineer submitted on others' (or their own) PRs. */
  reviewsGivenCount: number;
  /** Reviews submitted by anyone on PRs authored by this engineer. */
  reviewsReceivedCount: number;
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

export interface EngineerProfile {
  id: string;
  username: string;
  displayName: string | null;
}

export interface EngineerWithMetrics extends EngineerProfile {
  metrics: EngineerMetrics;
}
