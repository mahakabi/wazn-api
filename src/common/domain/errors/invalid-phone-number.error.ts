import { DomainError } from '../domain-error';
import { ErrorKind } from '../error-kind';

export class InvalidPhoneNumberError extends DomainError {
  readonly code = 'INVALID_PHONE';
  readonly kind = ErrorKind.Validation;

  constructor() {
    super('Enter a valid Saudi mobile number');
  }
}
