import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { toMemberBookingView } from '../domain/booking-view-builder';
import { type MemberBookingView } from '../domain/booking-views';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';

@Injectable()
export class GetMyBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(userId: string, bookingId: string): Promise<MemberBookingView> {
    const record = await this.bookings.findForUser(bookingId, userId);
    if (record === null) throw new BookingNotFoundError();
    return toMemberBookingView(record, this.clock.now());
  }
}
