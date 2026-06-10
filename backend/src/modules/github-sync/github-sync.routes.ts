import { Router } from 'express';
import { GithubSyncController } from './github-sync.controller';

export function createGithubSyncRoutes(controller: GithubSyncController): Router {
  const router = Router();

  router.post('/sync', controller.triggerSync);

  return router;
}
