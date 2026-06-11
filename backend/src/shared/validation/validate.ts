import { z, ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/app-error';

/**
 * Validates unknown input (req.query / req.params / req.body) against a zod schema
 * at the controller boundary. Throws a typed ValidationError (-> 422) on failure,
 * so malformed input never reaches the service layer.
 */
export function validate<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
      .join('; ');
    throw new ValidationError(message);
  }

  return result.data;
}
