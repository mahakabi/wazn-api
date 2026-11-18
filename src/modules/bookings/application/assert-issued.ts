import { type BookingStatus } from '../domain/booking-status';
import { BookingAlreadyConfirmedError } from '../domain/errors/booking-already-confirmed.error';
import { BookingCancelledError } from '../domain/errors/booking-cancelled.error';
import { BookingExpiredError } from '../domain/errors/booking-expired.error';

/** Business rule #3: only ISSUED bookings move on (to confirmed or cancelled). */
export function assertIssued(status: BookingStatus): void {
  switch (status) {
    case 'ISSUED':
      return;
    case 'CONFIRMED':
      throw new BookingAlreadyConfirmedError();
    case 'EXPIRED':
      throw new BookingExpiredError();
    case 'CANCELLED':
      throw new BookingCancelledError();
  }
}
