import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { effectiveStatus } from '../domain/booking-status';
import { toMemberBookingView } from '../domain/booking-view-builder';
import { type MemberBookingView } from '../domain/booking-views';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';
import { assertIssued } from './assert-issued';

@Injectable()
export class CancelBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(userId: string, bookingId: string): Promise<MemberBookingView> {
    const now = this.clock.now();
    const booking = await this.bookings.findForUser(bookingId, userId);
    if (booking === null) throw new BookingNotFoundError();
    assertIssued(effectiveStatus(booking, now));

    if (!(await this.bookings.cancel(booking.id, now))) {
      // Confirmed or expired between the read and the write: report what it is now.
      const latest = await this.bookings.findForUser(bookingId, userId);
      assertIssued(latest ? effectiveStatus(latest, now) : 'CANCELLED');
    }
    return toMemberBookingView({ ...booking, status: 'CANCELLED' }, now);
  }
}
