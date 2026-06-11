import { NotFoundError } from '../../shared/errors/app-error';
import { PaginationParams } from '../../shared/utils/pagination';
import { computePullRequestMetrics } from './pull-requests.metrics';
import { IPullRequestRepository, ListPullRequestsFilter } from './pull-requests.repository';
import { PullRequestSummary, PullRequestWithRelations } from './pull-requests.types';

export class PullRequestService {
  constructor(private readonly repository: IPullRequestRepository) {}

  async listPullRequests(
    filter: ListPullRequestsFilter,
    pagination: PaginationParams,
  ): Promise<{ items: PullRequestSummary[]; total: number }> {
    const { items, total } = await this.repository.list(filter, pagination);

    return {
      items: items.map((pr) => this.toSummary(pr)),
      total,
    };
  }

  async getPullRequest(id: string): Promise<PullRequestSummary> {
    const pr = await this.repository.findById(id);

    if (!pr) {
      throw new NotFoundError(`Pull request ${id} not found`);
    }

    return this.toSummary(pr);
  }

  private toSummary(pr: PullRequestWithRelations): PullRequestSummary {
    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      authorLogin: pr.authorLogin,
      state: pr.state,
      url: pr.url,
      createdAt: pr.createdAt,
      mergedAt: pr.mergedAt,
      metrics: computePullRequestMetrics(pr),
    };
  }
}
