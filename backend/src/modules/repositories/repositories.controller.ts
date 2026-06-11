import { NextFunction, Request, Response } from 'express';
import { parsePagination } from '../../shared/utils/pagination';
import { RepositoryService } from './repositories.service';

export class RepositoryController {
  constructor(private readonly service: RepositoryService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = parsePagination(req.query);
      const { items, total } = await this.service.listRepositories(pagination);
      res.json({ data: items, meta: { ...pagination, total } });
    } catch (err) {
      next(err);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.getRepositorySummary(req.params.id);
      res.json({ data: summary });
    } catch (err) {
      next(err);
    }
  };
}
