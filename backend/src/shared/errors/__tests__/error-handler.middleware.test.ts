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

  it('does not leak internal error messages on unknown errors', () => {
    const res = createMockResponse();
    const error = new Error('connect ECONNREFUSED 127.0.0.1:5432 (DB internals)');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(error, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
    });
    // The raw message is logged server-side, never sent to the client.
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
