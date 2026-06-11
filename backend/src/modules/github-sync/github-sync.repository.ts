import { PrismaClient } from '@prisma/client';
import { RawCommit, RawPullRequest, RawRepository, RawReview, RawReviewComment } from './github-sync.types';

export interface IGithubSyncRepository {
  getSyncState(externalId: string): Promise<{ lastSyncedAt: Date | null } | null>;
  upsertRepository(raw: RawRepository): Promise<{ id: string }>;
  setLastSyncedAt(repositoryId: string, syncedAt: Date): Promise<void>;
  upsertPullRequest(repositoryId: string, raw: RawPullRequest): Promise<{ id: string }>;
  replacePullRequestDetails(
    pullRequestId: string,
    data: { reviews: RawReview[]; reviewComments: RawReviewComment[]; commits: RawCommit[] },
  ): Promise<void>;
  upsertEngineers(usernames: string[]): Promise<void>;
}

export class GithubSyncRepository implements IGithubSyncRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSyncState(externalId: string): Promise<{ lastSyncedAt: Date | null } | null> {
    return this.prisma.repository.findUnique({
      where: { externalId },
      select: { lastSyncedAt: true },
    });
  }

  async setLastSyncedAt(repositoryId: string, syncedAt: Date): Promise<void> {
    await this.prisma.repository.update({
      where: { id: repositoryId },
      data: { lastSyncedAt: syncedAt },
    });
  }

  async upsertRepository(raw: RawRepository): Promise<{ id: string }> {
    return this.prisma.repository.upsert({
      where: { externalId: String(raw.id) },
      update: { name: raw.name, fullName: raw.fullName },
      create: {
        externalId: String(raw.id),
        name: raw.name,
        fullName: raw.fullName,
        provider: 'github',
      },
      select: { id: true },
    });
  }

  async upsertPullRequest(repositoryId: string, raw: RawPullRequest): Promise<{ id: string }> {
    const data = {
      number: raw.number,
      title: raw.title,
      authorLogin: raw.authorLogin,
      state: raw.state,
      url: raw.url,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      mergedAt: raw.mergedAt ? new Date(raw.mergedAt) : null,
      closedAt: raw.closedAt ? new Date(raw.closedAt) : null,
      additions: raw.additions,
      deletions: raw.deletions,
      changedFiles: raw.changedFiles,
    };

    return this.prisma.pullRequest.upsert({
      where: { externalId: String(raw.id) },
      update: data,
      create: { ...data, externalId: String(raw.id), repositoryId },
      select: { id: true },
    });
  }

  async replacePullRequestDetails(
    pullRequestId: string,
    data: { reviews: RawReview[]; reviewComments: RawReviewComment[]; commits: RawCommit[] },
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.review.deleteMany({ where: { pullRequestId } }),
      this.prisma.reviewComment.deleteMany({ where: { pullRequestId } }),
      this.prisma.commit.deleteMany({ where: { pullRequestId } }),
      this.prisma.review.createMany({
        data: data.reviews
          .filter((review) => review.submittedAt)
          .map((review) => ({
            externalId: String(review.id),
            pullRequestId,
            reviewerLogin: review.reviewerLogin,
            state: review.state,
            submittedAt: new Date(review.submittedAt as string),
          })),
      }),
      this.prisma.reviewComment.createMany({
        data: data.reviewComments.map((comment) => ({
          externalId: comment.externalId,
          pullRequestId,
          authorLogin: comment.authorLogin,
          createdAt: new Date(comment.createdAt),
        })),
      }),
      this.prisma.commit.createMany({
        data: data.commits.map((commit) => ({
          sha: commit.sha,
          pullRequestId,
          authorLogin: commit.authorLogin,
          committedAt: new Date(commit.committedAt),
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  async upsertEngineers(usernames: string[]): Promise<void> {
    const uniqueUsernames = [...new Set(usernames)];

    for (const username of uniqueUsernames) {
      await this.prisma.engineer.upsert({
        where: { username },
        update: {},
        create: { username },
      });
    }
  }
}
