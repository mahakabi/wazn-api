import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class BookingNotFoundError extends DomainError {
  readonly code = 'BOOKING_NOT_FOUND';
  readonly kind = ErrorKind.NotFound;

  constructor() {
    super('Booking not found');
  }
}
