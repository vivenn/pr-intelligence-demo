import { Router } from 'express';
import { PullRequestController } from './pull-requests.controller';

export function createPullRequestRoutes(controller: PullRequestController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id', controller.getById);

  return router;
}
