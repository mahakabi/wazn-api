import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  readonly kind = ErrorKind.Validation;

  constructor() {
    super('Enter a valid email address');
  }
}
