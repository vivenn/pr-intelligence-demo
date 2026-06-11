import { Router } from 'express';
import { EngineerController } from './engineers.controller';

export function createEngineerRoutes(controller: EngineerController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:username', controller.getByUsername);

  return router;
}
