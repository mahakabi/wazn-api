import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class PhoneInUseError extends DomainError {
  readonly code = 'PHONE_IN_USE';
  readonly kind = ErrorKind.Conflict;

  constructor() {
    super('This phone number is already linked to another account');
  }
}
