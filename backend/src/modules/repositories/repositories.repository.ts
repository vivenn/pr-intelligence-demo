import { PrismaClient } from '@prisma/client';
import { PaginationParams, toSkipTake } from '../../shared/utils/pagination';
import { RepositoryProfile, RepositorySummarySource } from './repositories.types';

export interface IRepositoryRepository {
  list(pagination: PaginationParams): Promise<{ items: RepositoryProfile[]; total: number }>;
  findById(id: string): Promise<RepositoryProfile | null>;
  getSummarySource(repositoryId: string): Promise<RepositorySummarySource>;
}

export class RepositoryRepository implements IRepositoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(pagination: PaginationParams): Promise<{ items: RepositoryProfile[]; total: number }> {
    const { skip, take } = toSkipTake(pagination);

    const [items, total] = await Promise.all([
      this.prisma.repository.findMany({
        select: { id: true, name: true, fullName: true },
        orderBy: { fullName: 'asc' },
        skip,
        take,
      }),
      this.prisma.repository.count(),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<RepositoryProfile | null> {
    return this.prisma.repository.findUnique({
      where: { id },
      select: { id: true, name: true, fullName: true },
    });
  }

  async getSummarySource(repositoryId: string): Promise<RepositorySummarySource> {
    const [pullRequests, reviewCount, commentCount] = await Promise.all([
      this.prisma.pullRequest.findMany({
        where: { repositoryId },
        select: { state: true, createdAt: true, mergedAt: true, additions: true, deletions: true },
      }),
      this.prisma.review.count({ where: { pullRequest: { repositoryId } } }),
      this.prisma.reviewComment.count({ where: { pullRequest: { repositoryId } } }),
    ]);

    return { pullRequests, reviewCount, commentCount };
  }
}
