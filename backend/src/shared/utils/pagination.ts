export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta extends PaginationParams {
  total: number;
}

export function toSkipTake({ page, pageSize }: PaginationParams): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
