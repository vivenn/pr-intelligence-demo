import { Router } from 'express';
import { RepositoryController } from './repositories.controller';

export function createRepositoryRoutes(controller: RepositoryController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id/summary', controller.getSummary);

  return router;
}
