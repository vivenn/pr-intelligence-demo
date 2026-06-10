import { GithubClient } from './github.client';
import { IGithubSyncRepository } from './github-sync.repository';
import { RepositorySyncResult } from './github-sync.types';

export class GithubSyncService {
  constructor(
    private readonly githubClient: GithubClient,
    private readonly repository: IGithubSyncRepository,
    private readonly org: string,
  ) {}

  async syncRepository(repoName: string): Promise<RepositorySyncResult> {
    const rawRepo = await this.githubClient.getRepository(this.org, repoName);
    const { id: repositoryId } = await this.repository.upsertRepository(rawRepo);

    const pullRequestsData = await this.githubClient.getRepositoryPullRequests(this.org, repoName);

    const engineerUsernames = new Set<string>();

    for (const { pullRequest, reviews, reviewComments, commits } of pullRequestsData) {
      const { id: pullRequestId } = await this.repository.upsertPullRequest(repositoryId, pullRequest);
      await this.repository.replacePullRequestDetails(pullRequestId, { reviews, reviewComments, commits });

      engineerUsernames.add(pullRequest.authorLogin);
      reviews.forEach((review) => engineerUsernames.add(review.reviewerLogin));
      reviewComments.forEach((comment) => engineerUsernames.add(comment.authorLogin));
      commits.forEach((commit) => {
        if (commit.authorLogin) {
          engineerUsernames.add(commit.authorLogin);
        }
      });
    }

    await this.repository.upsertEngineers([...engineerUsernames]);

    return { repository: rawRepo.fullName, pullRequestsSynced: pullRequestsData.length };
  }

  async syncAll(repoNames: string[]): Promise<RepositorySyncResult[]> {
    const results: RepositorySyncResult[] = [];

    for (const repoName of repoNames) {
      results.push(await this.syncRepository(repoName));
    }

    return results;
  }
}
