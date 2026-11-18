import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

/** Gym staff identify the member by (masked) phone, so it's needed before booking. */
export class PhoneRequiredError extends DomainError {
  readonly code = 'PHONE_REQUIRED';
  readonly kind = ErrorKind.BusinessRule;

  constructor() {
    super('Add your phone number before booking');
  }
}
