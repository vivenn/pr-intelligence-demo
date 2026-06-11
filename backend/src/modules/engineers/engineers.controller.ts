import { NextFunction, Request, Response } from 'express';
import { parsePagination } from '../../shared/utils/pagination';
import { EngineerService } from './engineers.service';

export class EngineerController {
  constructor(private readonly service: EngineerService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = parsePagination(req.query);
      const { items, total } = await this.service.listEngineers(pagination);
      res.json({ data: items, meta: { ...pagination, total } });
    } catch (err) {
      next(err);
    }
  };

  getByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const engineer = await this.service.getEngineer(req.params.username);
      res.json({ data: engineer });
    } catch (err) {
      next(err);
    }
  };
}
