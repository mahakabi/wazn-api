import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';

@Injectable()
export class ExpireOverdueBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  execute(): Promise<number> {
    return this.bookings.expireOverdue(this.clock.now());
  }
}
