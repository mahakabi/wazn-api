import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class InvalidBookingCodeError extends DomainError {
  readonly code = 'INVALID_BOOKING_CODE';
  readonly kind = ErrorKind.Validation;

  constructor() {
    super('Booking codes look like WZ-7K42');
  }
}
