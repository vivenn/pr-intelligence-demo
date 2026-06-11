import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { paginationSchema, uuidParamSchema } from '../../shared/validation/schemas';
import { validate } from '../../shared/validation/validate';
import { PullRequestService } from './pull-requests.service';

const listQuerySchema = paginationSchema.extend({
  repositoryId: z.string().uuid().optional(),
  author: z.string().min(1).max(100).optional(),
});

export class PullRequestController {
  constructor(private readonly service: PullRequestService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, pageSize, repositoryId, author } = validate(listQuerySchema, req.query);

      const { items, total } = await this.service.listPullRequests(
        { repositoryId, authorLogin: author },
        { page, pageSize },
      );

      res.json({ data: items, meta: { page, pageSize, total } });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = validate(uuidParamSchema, req.params);
      const pr = await this.service.getPullRequest(id);
      res.json({ data: pr });
    } catch (err) {
      next(err);
    }
  };
}
