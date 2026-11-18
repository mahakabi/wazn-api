import { type ValidationError } from '@nestjs/common';

/** Flattens nested class-validator errors to `{ "plan.months": ["must be one of ..."] }`. */
export function flattenValidationErrors(
  errors: readonly ValidationError[],
  parentPath = '',
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) {
      result[path] = Object.values(error.constraints);
    }
    if (error.children && error.children.length > 0) {
      Object.assign(result, flattenValidationErrors(error.children, path));
    }
  }
  return result;
}
