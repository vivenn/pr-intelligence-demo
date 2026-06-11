import { IGithubSyncRepository } from './github-sync.repository';
import { ISourceControlClient, RepositorySyncResult } from './github-sync.types';

export class GithubSyncService {
  constructor(
    private readonly client: ISourceControlClient,
    private readonly repository: IGithubSyncRepository,
    private readonly org: string,
  ) {}

  async syncRepository(repoName: string): Promise<RepositorySyncResult> {
    // Capture the watermark before fetching, so updates landing mid-sync aren't missed next time.
    const syncStartedAt = new Date();

    const rawRepo = await this.client.getRepository(this.org, repoName);
    const previous = await this.repository.getSyncState(String(rawRepo.id));
    const { id: repositoryId } = await this.repository.upsertRepository(rawRepo);

    const pullRequestsData = await this.client.getRepositoryPullRequests(
      this.org,
      repoName,
      previous?.lastSyncedAt ?? undefined,
    );

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
    await this.repository.setLastSyncedAt(repositoryId, syncStartedAt);

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
