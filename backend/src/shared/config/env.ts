import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required'),
  GITHUB_ORG: z.string().min(1, 'GITHUB_ORG is required'),
  GITHUB_REPOS: z
    .string()
    .min(1, 'GITHUB_REPOS is required')
    .transform((value) => value.split(',').map((repo) => repo.trim()).filter(Boolean)),
  // Optional cron expression for scheduled sync (e.g. "*/30 * * * *"). Unset = manual sync only.
  SYNC_CRON: z.string().trim().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
