import { NotFoundError } from '../../shared/errors/app-error';
import { PaginationParams } from '../../shared/utils/pagination';
import { computeRepositorySummary } from './repositories.metrics';
import { IRepositoryRepository } from './repositories.repository';
import { RepositoryProfile, RepositorySummary } from './repositories.types';

export class RepositoryService {
  constructor(private readonly repository: IRepositoryRepository) {}

  async listRepositories(pagination: PaginationParams): Promise<{ items: RepositoryProfile[]; total: number }> {
    return this.repository.list(pagination);
  }

  async getRepositorySummary(id: string): Promise<RepositorySummary> {
    const repo = await this.repository.findById(id);

    if (!repo) {
      throw new NotFoundError(`Repository ${id} not found`);
    }

    const source = await this.repository.getSummarySource(id);

    return {
      ...repo,
      metrics: computeRepositorySummary(source),
    };
  }
}
