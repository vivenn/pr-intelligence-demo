import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { env } from './shared/config/env';
import { prisma } from './shared/db/prisma';
import { errorHandler } from './shared/errors/error-handler.middleware';
import { GithubSyncController } from './modules/github-sync/github-sync.controller';
import { createGithubSyncService } from './modules/github-sync/github-sync.factory';
import { createGithubSyncRoutes } from './modules/github-sync/github-sync.routes';
import { PullRequestController } from './modules/pull-requests/pull-requests.controller';
import { PullRequestRepository } from './modules/pull-requests/pull-requests.repository';
import { PullRequestService } from './modules/pull-requests/pull-requests.service';
import { createPullRequestRoutes } from './modules/pull-requests/pull-requests.routes';
import { EngineerController } from './modules/engineers/engineers.controller';
import { EngineerRepository } from './modules/engineers/engineers.repository';
import { EngineerService } from './modules/engineers/engineers.service';
import { createEngineerRoutes } from './modules/engineers/engineers.routes';
import { RepositoryController } from './modules/repositories/repositories.controller';
import { RepositoryRepository } from './modules/repositories/repositories.repository';
import { RepositoryService } from './modules/repositories/repositories.service';
import { createRepositoryRoutes } from './modules/repositories/repositories.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ data: { status: 'ok' } });
  });

  const githubSyncService = createGithubSyncService(prisma, {
    githubToken: env.GITHUB_TOKEN,
    org: env.GITHUB_ORG,
  });
  const githubSyncController = new GithubSyncController(githubSyncService, env.GITHUB_REPOS);

  app.use('/api/github', createGithubSyncRoutes(githubSyncController));

  const pullRequestRepository = new PullRequestRepository(prisma);
  const pullRequestService = new PullRequestService(pullRequestRepository);
  const pullRequestController = new PullRequestController(pullRequestService);

  app.use('/api/pull-requests', createPullRequestRoutes(pullRequestController));

  const engineerRepository = new EngineerRepository(prisma);
  const engineerService = new EngineerService(engineerRepository);
  const engineerController = new EngineerController(engineerService);

  app.use('/api/engineers', createEngineerRoutes(engineerController));

  const repositoryRepository = new RepositoryRepository(prisma);
  const repositoryService = new RepositoryService(repositoryRepository);
  const repositoryController = new RepositoryController(repositoryService);

  app.use('/api/repositories', createRepositoryRoutes(repositoryController));

  app.use(errorHandler);

  return app;
}
