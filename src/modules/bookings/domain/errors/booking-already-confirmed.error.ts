import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class BookingAlreadyConfirmedError extends DomainError {
  readonly code = 'BOOKING_ALREADY_CONFIRMED';
  readonly kind = ErrorKind.Conflict;

  constructor() {
    super('This code was already used');
  }
}
