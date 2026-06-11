import { PrismaClient } from '@prisma/client';
import { PaginationParams, toSkipTake } from '../../shared/utils/pagination';
import { PullRequestWithRelations } from './pull-requests.types';

export interface ListPullRequestsFilter {
  repositoryId?: string;
  authorLogin?: string;
}

export interface IPullRequestRepository {
  list(
    filter: ListPullRequestsFilter,
    pagination: PaginationParams,
  ): Promise<{ items: PullRequestWithRelations[]; total: number }>;
  findById(id: string): Promise<PullRequestWithRelations | null>;
}

const relationsSelect = {
  reviews: { select: { submittedAt: true } },
  reviewComments: { select: { id: true } },
} as const;

export class PullRequestRepository implements IPullRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    filter: ListPullRequestsFilter,
    pagination: PaginationParams,
  ): Promise<{ items: PullRequestWithRelations[]; total: number }> {
    const where = {
      ...(filter.repositoryId ? { repositoryId: filter.repositoryId } : {}),
      ...(filter.authorLogin ? { authorLogin: filter.authorLogin } : {}),
    };

    const { skip, take } = toSkipTake(pagination);

    const [items, total] = await Promise.all([
      this.prisma.pullRequest.findMany({
        where,
        include: relationsSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.pullRequest.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<PullRequestWithRelations | null> {
    return this.prisma.pullRequest.findUnique({
      where: { id },
      include: relationsSelect,
    });
  }
}
