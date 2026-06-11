import { Request, Response } from 'express';
import { UnauthorizedError } from '../../errors/app-error';
import { apiKeyAuth } from '../auth.middleware';

function mockRequest(headerValue?: string): Request {
  return { header: jest.fn().mockReturnValue(headerValue) } as unknown as Request;
}

describe('apiKeyAuth', () => {
  it('passes through when no key is configured (auth disabled)', () => {
    const next = jest.fn();
    apiKeyAuth(undefined)(mockRequest(), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('allows the request when the header matches the configured key', () => {
    const next = jest.fn();
    apiKeyAuth('secret')(mockRequest('secret'), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when the header is missing or wrong', () => {
    const next = jest.fn();
    apiKeyAuth('secret')(mockRequest('wrong'), {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
