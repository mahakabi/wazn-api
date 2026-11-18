import { Inject, Injectable } from '@nestjs/common';
import { BookingCode } from '../domain/booking-code';
import { type StaffBookingRecord } from '../domain/booking-record';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { NotGymStaffError } from '../domain/errors/not-gym-staff.error';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';
import { STAFF_DIRECTORY, type StaffDirectory } from '../domain/ports/staff-directory';
import { membershipFor, type StaffMembership } from '../domain/staff-membership';

export interface ScopedBooking {
  readonly booking: StaffBookingRecord;
  readonly membership: StaffMembership;
}

/**
 * Finds a booking by code within the caller's gym/branch. A code from another gym is
 * reported as not found, so staff can't probe other gyms' codes.
 */
@Injectable()
export class StaffBookingLookup {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(STAFF_DIRECTORY) private readonly staff: StaffDirectory,
  ) {}

  async find(staffUserId: string, rawCode: string): Promise<ScopedBooking> {
    const code = BookingCode.parse(rawCode);
    const memberships = await this.staff.membershipsOf(staffUserId);
    if (memberships.length === 0) throw new NotGymStaffError();

    const booking = await this.bookings.findByCode(code.value);
    const membership = booking && membershipFor(memberships, booking.place);
    if (booking === null || membership === null) throw new BookingNotFoundError();
    return { booking, membership };
  }
}
