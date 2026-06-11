import { NotFoundError } from '../../shared/errors/app-error';
import { PaginationParams } from '../../shared/utils/pagination';
import { computeEngineerMetrics } from './engineers.metrics';
import { IEngineerRepository } from './engineers.repository';
import { EngineerProfile, EngineerWithMetrics } from './engineers.types';

export class EngineerService {
  constructor(private readonly repository: IEngineerRepository) {}

  async listEngineers(pagination: PaginationParams): Promise<{ items: EngineerProfile[]; total: number }> {
    return this.repository.list(pagination);
  }

  async getEngineer(username: string): Promise<EngineerWithMetrics> {
    const engineer = await this.repository.findByUsername(username);

    if (!engineer) {
      throw new NotFoundError(`Engineer ${username} not found`);
    }

    const source = await this.repository.getMetricsSource(username);

    return {
      ...engineer,
      // Fall back to the username when an engineer has no display name set.
      displayName: engineer.displayName ?? engineer.username,
      metrics: computeEngineerMetrics(source),
    };
  }
}
