import { PrismaClient } from '@prisma/client';
import { PaginationParams, toSkipTake } from '../../shared/utils/pagination';
import { EngineerMetricsSource, EngineerProfile } from './engineers.types';

export interface IEngineerRepository {
  list(pagination: PaginationParams): Promise<{ items: EngineerProfile[]; total: number }>;
  findByUsername(username: string): Promise<EngineerProfile | null>;
  getMetricsSource(username: string): Promise<EngineerMetricsSource>;
}

export class EngineerRepository implements IEngineerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(pagination: PaginationParams): Promise<{ items: EngineerProfile[]; total: number }> {
    const { skip, take } = toSkipTake(pagination);

    const [items, total] = await Promise.all([
      this.prisma.engineer.findMany({
        select: { id: true, username: true, displayName: true },
        orderBy: { username: 'asc' },
        skip,
        take,
      }),
      this.prisma.engineer.count(),
    ]);

    return { items, total };
  }

  async findByUsername(username: string): Promise<EngineerProfile | null> {
    return this.prisma.engineer.findUnique({
      where: { username },
      select: { id: true, username: true, displayName: true },
    });
  }

  async getMetricsSource(username: string): Promise<EngineerMetricsSource> {
    const [authoredPullRequests, reviewsGivenCount, reviewsReceivedCount] = await Promise.all([
      this.prisma.pullRequest.findMany({
        where: { authorLogin: username },
        select: { createdAt: true, mergedAt: true, additions: true, deletions: true },
      }),
      this.prisma.review.count({ where: { reviewerLogin: username } }),
      this.prisma.review.count({ where: { pullRequest: { authorLogin: username } } }),
    ]);

    return { authoredPullRequests, reviewsGivenCount, reviewsReceivedCount };
  }
}
