import { z } from 'zod';
import { ValidationError } from '../../errors/app-error';
import { paginationSchema, uuidParamSchema } from '../schemas';
import { validate } from '../validate';

describe('validate', () => {
  it('returns parsed data when valid', () => {
    const schema = z.object({ name: z.string() });
    expect(validate(schema, { name: 'alice' })).toEqual({ name: 'alice' });
  });

  it('throws ValidationError on invalid input', () => {
    const schema = z.object({ name: z.string() });
    expect(() => validate(schema, { name: 123 })).toThrow(ValidationError);
  });
});

describe('paginationSchema', () => {
  it('applies defaults when params are absent', () => {
    expect(validate(paginationSchema, {})).toEqual({ page: 1, pageSize: 20 });
  });

  it('coerces string query params to numbers', () => {
    expect(validate(paginationSchema, { page: '3', pageSize: '50' })).toEqual({ page: 3, pageSize: 50 });
  });

  it('rejects a page size above the cap', () => {
    expect(() => validate(paginationSchema, { pageSize: '500' })).toThrow(ValidationError);
  });
});

describe('uuidParamSchema', () => {
  it('rejects a non-uuid id', () => {
    expect(() => validate(uuidParamSchema, { id: 'not-a-uuid' })).toThrow(ValidationError);
  });

  it('accepts a valid uuid', () => {
    const id = '85bbbb9c-f8e5-4c52-b35a-fb1f005b89bf';
    expect(validate(uuidParamSchema, { id })).toEqual({ id });
  });
});
