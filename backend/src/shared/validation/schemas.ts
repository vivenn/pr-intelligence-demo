import { z } from 'zod';

/** Shared pagination query schema: coerces strings, applies defaults, caps page size. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParamSchema = z.object({ id: z.string().uuid() });
