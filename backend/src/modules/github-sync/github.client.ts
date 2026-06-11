import { Octokit } from '@octokit/rest';
import {
  ISourceControlClient,
  PullRequestSyncData,
  RawCommit,
  RawRepository,
  RawReview,
  RawReviewComment,
  RawPullRequest,
} from './github-sync.types';

const DEFAULT_MAX_PULL_REQUESTS = 30;

export class GithubClient implements ISourceControlClient {
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

      const [reviewData, inlineComments, issueComments, commits] = await Promise.all([
        this.getReviewsAndBodyComments(owner, repo, pull.number),
        this.getReviewComments(owner, repo, pull.number),
        this.getIssueComments(owner, repo, pull.number),
        this.getCommits(owner, repo, pull.number),
      ]);

      // Comment metrics count all written feedback: inline code comments, conversation
      // comments, and the summary body a reviewer leaves when submitting a review.
      const reviewComments = [...inlineComments, ...issueComments, ...reviewData.bodyComments];

      results.push({ pullRequest, reviews: reviewData.reviews, reviewComments, commits });
    }

    return results;
  }

  /**
   * Fetches reviews once and derives two things from them: the review records
   * (for review-count/timing metrics) and, for reviews that carry a written summary,
   * a comment record (so review feedback shows up in comment metrics).
   */
  private async getReviewsAndBodyComments(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<{ reviews: RawReview[]; bodyComments: RawReviewComment[] }> {
    const { data } = await this.octokit.pulls.listReviews({ owner, repo, pull_number: pullNumber });

    const reviews: RawReview[] = data.map((review) => ({
      id: review.id,
      reviewerLogin: review.user?.login ?? 'unknown',
      state: review.state,
      submittedAt: review.submitted_at ?? null,
    }));

    const bodyComments: RawReviewComment[] = data
      .filter((review) => review.body && review.body.trim().length > 0)
      .map((review) => ({
        externalId: `reviewbody:${review.id}`,
        authorLogin: review.user?.login ?? 'unknown',
        createdAt: review.submitted_at ?? new Date().toISOString(),
      }));

    return { reviews, bodyComments };
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
