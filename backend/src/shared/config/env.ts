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
  // Comma-separated list of allowed frontend origins for CORS (no wildcard in production).
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  // Optional API key. When set, all /api routes require a matching X-API-Key header.
  // Unset = auth disabled (local dev / demo).
  API_KEY: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
