import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { paginationSchema } from '../../shared/validation/schemas';
import { validate } from '../../shared/validation/validate';
import { EngineerService } from './engineers.service';

const usernameParamSchema = z.object({ username: z.string().min(1).max(100) });

export class EngineerController {
  constructor(private readonly service: EngineerService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, pageSize } = validate(paginationSchema, req.query);
      const { items, total } = await this.service.listEngineers({ page, pageSize });
      res.json({ data: items, meta: { page, pageSize, total } });
    } catch (err) {
      next(err);
    }
  };

  getByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = validate(usernameParamSchema, req.params);
      const engineer = await this.service.getEngineer(username);
      res.json({ data: engineer });
    } catch (err) {
      next(err);
    }
  };
}
