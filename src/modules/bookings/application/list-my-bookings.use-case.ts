import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { toMemberBookingView } from '../domain/booking-view-builder';
import { type MemberBookingView } from '../domain/booking-views';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';

/** Newest first. The app splits them into Active (ISSUED) and Past (everything else). */
@Injectable()
export class ListMyBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(userId: string): Promise<MemberBookingView[]> {
    const now = this.clock.now();
    const records = await this.bookings.listForUser(userId);
    return records.map((record) => toMemberBookingView(record, now));
  }
}
