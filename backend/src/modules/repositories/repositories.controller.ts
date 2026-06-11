import { NextFunction, Request, Response } from 'express';
import { paginationSchema, uuidParamSchema } from '../../shared/validation/schemas';
import { validate } from '../../shared/validation/validate';
import { RepositoryService } from './repositories.service';

export class RepositoryController {
  constructor(private readonly service: RepositoryService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, pageSize } = validate(paginationSchema, req.query);
      const { items, total } = await this.service.listRepositories({ page, pageSize });
      res.json({ data: items, meta: { page, pageSize, total } });
    } catch (err) {
      next(err);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = validate(uuidParamSchema, req.params);
      const summary = await this.service.getRepositorySummary(id);
      res.json({ data: summary });
    } catch (err) {
      next(err);
    }
  };
}
