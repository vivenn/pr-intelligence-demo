import { Request, Response } from 'express';
import { errorHandler } from '../error-handler.middleware';
import { NotFoundError } from '../app-error';

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('formats AppError subclasses with their status code and code', () => {
    const res = createMockResponse();
    const error = new NotFoundError('Pull request not found');

    errorHandler(error, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Pull request not found', code: 'NOT_FOUND' },
    });
  });

  it('formats unknown errors as 500 internal server errors', () => {
    const res = createMockResponse();
    const error = new Error('boom');

    errorHandler(error, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'boom', code: 'INTERNAL_SERVER_ERROR' },
    });
  });
});
