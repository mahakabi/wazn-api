import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class BookingExpiredError extends DomainError {
  readonly code = 'BOOKING_EXPIRED';
  readonly kind = ErrorKind.BusinessRule;

  constructor() {
    super('This code has expired');
  }
}
