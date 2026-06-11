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
  id: number;
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
