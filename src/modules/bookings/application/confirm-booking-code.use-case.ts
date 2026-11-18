import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { SETTINGS_READER, type SettingsReader } from '../../settings/domain/settings-reader';
import { effectiveStatus } from '../domain/booking-status';
import { toStaffBookingView } from '../domain/booking-view-builder';
import { type StaffBookingView } from '../domain/booking-views';
import { CommissionRate } from '../domain/commission-rate';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';
import { assertIssued } from './assert-issued';
import { StaffBookingLookup } from './staff-booking-lookup';

/**
 * Front desk step 2, after the member paid at the gym. Confirms in one conditional write:
 * the booking must still be ISSUED and unexpired. Commission (rule #4) = locked price ×
 * the gym's rate, or the default rate.
 */
@Injectable()
export class ConfirmBookingCodeUseCase {
  constructor(
    private readonly lookup: StaffBookingLookup,
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(SETTINGS_READER) private readonly settings: SettingsReader,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(staffUserId: string, code: string): Promise<StaffBookingView> {
    const now = this.clock.now();
    const { booking, membership } = await this.lookup.find(staffUserId, code);
    assertIssued(effectiveStatus(booking, now));

    const rate = booking.gymCommissionRate ?? (await this.settings.get()).defaultCommissionRate;
    const confirmed = await this.bookings.confirm({
      bookingId: booking.id,
      staffId: membership.staffId,
      commission: CommissionRate.parse(rate).commissionFor(booking.lockedPrice),
      at: now,
    });
    if (!confirmed) {
      // Someone else confirmed/cancelled it, or it expired, between the read and the write.
      const latest = await this.bookings.findByCode(booking.code);
      assertIssued(latest ? effectiveStatus(latest, now) : 'CANCELLED');
    }
    return toStaffBookingView({ ...booking, status: 'CONFIRMED', confirmedAt: now }, now);
  }
}
