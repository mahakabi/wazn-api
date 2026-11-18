import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

/** A price mismatch is about what the gym charged against a code, so it must name the booking. */
export class BookingRequiredError extends DomainError {
  readonly code = 'BOOKING_REQUIRED';
  readonly kind = ErrorKind.Validation;

  constructor() {
    super('Choose the booking this is about');
  }
}
