import { NextFunction, Request, Response } from 'express';
import { parsePagination } from '../../shared/utils/pagination';
import { PullRequestService } from './pull-requests.service';

export class PullRequestController {
  constructor(private readonly service: PullRequestService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = parsePagination(req.query);
      const filter = {
        repositoryId: typeof req.query.repositoryId === 'string' ? req.query.repositoryId : undefined,
        authorLogin: typeof req.query.author === 'string' ? req.query.author : undefined,
      };

      const { items, total } = await this.service.listPullRequests(filter, pagination);

      res.json({ data: items, meta: { ...pagination, total } });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pr = await this.service.getPullRequest(req.params.id);
      res.json({ data: pr });
    } catch (err) {
      next(err);
    }
  };
}
