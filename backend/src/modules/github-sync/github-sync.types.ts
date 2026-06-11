export interface RawPullRequest {
  id: number;
  number: number;
  title: string;
  authorLogin: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface RawReview {
  id: number;
  reviewerLogin: string;
  state: string;
  submittedAt: string | null;
}

export interface RawReviewComment {
  // Source-prefixed id (e.g. "review:123" or "issue:456") since inline review-comment
  // and conversation issue-comment IDs are separate sequences that can collide.
  externalId: string;
  authorLogin: string;
  createdAt: string;
}

export interface RawCommit {
  sha: string;
  authorLogin: string | null;
  committedAt: string;
}

export interface RawRepository {
  id: number;
  name: string;
  fullName: string;
}

export interface PullRequestSyncData {
  pullRequest: RawPullRequest;
  reviews: RawReview[];
  reviewComments: RawReviewComment[];
  commits: RawCommit[];
}

export interface RepositorySyncResult {
  repository: string;
  pullRequestsSynced: number;
}

/**
 * Provider-agnostic source-control client contract. `GithubClient` implements this today;
 * a future `GitlabClient` would implement the same interface, and the sync service —
 * which depends on this interface, not the concrete class — would not change.
 */
export interface ISourceControlClient {
  getRepository(owner: string, repo: string): Promise<RawRepository>;
  getRepositoryPullRequests(owner: string, repo: string, since?: Date): Promise<PullRequestSyncData[]>;
}
