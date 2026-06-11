import { Octokit } from '@octokit/rest';
import {
  PullRequestSyncData,
  RawCommit,
  RawRepository,
  RawReview,
  RawReviewComment,
  RawPullRequest,
} from './github-sync.types';

const DEFAULT_MAX_PULL_REQUESTS = 30;

export class GithubClient {
  constructor(
    private readonly octokit: Octokit,
    private readonly maxPullRequests: number = DEFAULT_MAX_PULL_REQUESTS,
  ) {}

  async getRepository(owner: string, repo: string): Promise<RawRepository> {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return { id: data.id, name: data.name, fullName: data.full_name };
  }

  async getRepositoryPullRequests(owner: string, repo: string): Promise<PullRequestSyncData[]> {
    const { data: pulls } = await this.octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      sort: 'updated',
      direction: 'desc',
      per_page: this.maxPullRequests,
    });

    const results: PullRequestSyncData[] = [];

    for (const pull of pulls) {
      const { data: detail } = await this.octokit.pulls.get({ owner, repo, pull_number: pull.number });

      const pullRequest: RawPullRequest = {
        id: detail.id,
        number: detail.number,
        title: detail.title,
        authorLogin: detail.user?.login ?? 'unknown',
        state: detail.merged_at ? 'merged' : detail.state,
        url: detail.html_url,
        createdAt: detail.created_at,
        updatedAt: detail.updated_at,
        mergedAt: detail.merged_at,
        closedAt: detail.closed_at,
        additions: detail.additions ?? 0,
        deletions: detail.deletions ?? 0,
        changedFiles: detail.changed_files ?? 0,
      };

      const [reviews, inlineComments, issueComments, commits] = await Promise.all([
        this.getReviews(owner, repo, pull.number),
        this.getReviewComments(owner, repo, pull.number),
        this.getIssueComments(owner, repo, pull.number),
        this.getCommits(owner, repo, pull.number),
      ]);

      // Combine inline (code) review comments and conversation (issue) comments.
      const reviewComments = [...inlineComments, ...issueComments];

      results.push({ pullRequest, reviews, reviewComments, commits });
    }

    return results;
  }

  private async getReviews(owner: string, repo: string, pullNumber: number): Promise<RawReview[]> {
    const { data } = await this.octokit.pulls.listReviews({ owner, repo, pull_number: pullNumber });

    return data.map((review) => ({
      id: review.id,
      reviewerLogin: review.user?.login ?? 'unknown',
      state: review.state,
      submittedAt: review.submitted_at ?? null,
    }));
  }

  /** Inline comments on the diff (Files changed tab). */
  private async getReviewComments(owner: string, repo: string, pullNumber: number): Promise<RawReviewComment[]> {
    const { data } = await this.octokit.pulls.listReviewComments({ owner, repo, pull_number: pullNumber });

    return data.map((comment) => ({
      externalId: `review:${comment.id}`,
      authorLogin: comment.user?.login ?? 'unknown',
      createdAt: comment.created_at,
    }));
  }

  /** Conversation comments on the PR (the issue-comment thread). */
  private async getIssueComments(owner: string, repo: string, pullNumber: number): Promise<RawReviewComment[]> {
    const { data } = await this.octokit.issues.listComments({ owner, repo, issue_number: pullNumber });

    return data.map((comment) => ({
      externalId: `issue:${comment.id}`,
      authorLogin: comment.user?.login ?? 'unknown',
      createdAt: comment.created_at ?? new Date().toISOString(),
    }));
  }

  private async getCommits(owner: string, repo: string, pullNumber: number): Promise<RawCommit[]> {
    const { data } = await this.octokit.pulls.listCommits({ owner, repo, pull_number: pullNumber });

    return data.map((commit) => ({
      sha: commit.sha,
      authorLogin: commit.author?.login ?? null,
      committedAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? new Date().toISOString(),
    }));
  }
}
