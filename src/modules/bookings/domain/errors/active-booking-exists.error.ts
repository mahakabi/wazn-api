import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class ActiveBookingExistsError extends DomainError {
  readonly code = 'ACTIVE_BOOKING_EXISTS';
  readonly kind = ErrorKind.Conflict;

  constructor(bookingId: string) {
    super('You already have an active booking for this plan', { bookingId });
  }
}
