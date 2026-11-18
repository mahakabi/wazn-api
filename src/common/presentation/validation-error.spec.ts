import { type ValidationError } from '@nestjs/common';
import { flattenValidationErrors } from './validation-error';

function validationError(
  property: string,
  constraints?: Record<string, string>,
  children: ValidationError[] = [],
): ValidationError {
  return { property, constraints, children };
}

describe('flattenValidationErrors', () => {
  it('flattens nested errors into dotted paths', () => {
    const errors = [
      validationError('phone', { isPhoneNumber: 'phone must be valid' }),
      validationError('plan', undefined, [
        validationError('months', { isIn: 'months must be one of 1, 3, 6, 12' }),
      ]),
    ];

    expect(flattenValidationErrors(errors)).toEqual({
      phone: ['phone must be valid'],
      'plan.months': ['months must be one of 1, 3, 6, 12'],
    });
  });
});
