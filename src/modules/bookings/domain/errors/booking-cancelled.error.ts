import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class BookingCancelledError extends DomainError {
  readonly code = 'BOOKING_CANCELLED';
  readonly kind = ErrorKind.BusinessRule;

  constructor() {
    super('This booking was cancelled');
  }
}
