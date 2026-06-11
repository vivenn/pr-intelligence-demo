import { Octokit } from '@octokit/rest';
import { PrismaClient } from '@prisma/client';
import { GithubClient } from './github.client';
import { GithubSyncRepository } from './github-sync.repository';
import { GithubSyncService } from './github-sync.service';

/**
 * Builds a fully-wired GithubSyncService. Shared by the HTTP app (manual sync route)
 * and the scheduler (cron sync) so the dependency wiring lives in one place.
 */
export function createGithubSyncService(
  prisma: PrismaClient,
  config: { githubToken: string; org: string },
): GithubSyncService {
  const octokit = new Octokit({ auth: config.githubToken });
  const githubClient = new GithubClient(octokit);
  const repository = new GithubSyncRepository(prisma);
  return new GithubSyncService(githubClient, repository, config.org);
}
