import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { toStaffBookingView } from '../domain/booking-view-builder';
import { type StaffBookingView } from '../domain/booking-views';
import { StaffBookingLookup } from './staff-booking-lookup';

/** Front desk step 1: look the code up. Returns its status rather than failing, so the UI can explain. */
@Injectable()
export class VerifyBookingCodeUseCase {
  constructor(
    private readonly lookup: StaffBookingLookup,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(staffUserId: string, code: string): Promise<StaffBookingView> {
    const { booking } = await this.lookup.find(staffUserId, code);
    return toStaffBookingView(booking, this.clock.now());
  }
}
