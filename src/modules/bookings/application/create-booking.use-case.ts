import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { effectivePrice, liveOfferOf } from '../../catalog/domain/plan-pricing';
import { SETTINGS_READER, type SettingsReader } from '../../settings/domain/settings-reader';
import { toMemberBookingView } from '../domain/booking-view-builder';
import { type MemberBookingView } from '../domain/booking-views';
import { ActiveBookingExistsError } from '../domain/errors/active-booking-exists.error';
import { GymNotPartnerError } from '../domain/errors/gym-not-partner.error';
import { PhoneRequiredError } from '../domain/errors/phone-required.error';
import { PlanNotFoundError } from '../domain/errors/plan-not-found.error';
import {
  BOOKABLE_PLAN_READER,
  type BookablePlanReader,
} from '../domain/ports/bookable-plan-reader';
import {
  BOOKING_CODE_GENERATOR,
  type BookingCodeGenerator,
} from '../domain/ports/booking-code-generator';
import { BOOKING_REPOSITORY, type BookingRepository } from '../domain/ports/booking-repository';
import {
  MEMBER_CONTACT_READER,
  type MemberContactReader,
} from '../domain/ports/member-contact-reader';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** ~1M codes; a few retries make a collision failure practically impossible. */
const MAX_CODE_ATTEMPTS = 5;

/**
 * Book = lock today's price (business rule #1) and issue a WZ-XXXX code valid for
 * `code_validity_days`. The member pays at the gym.
 */
@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject(BOOKABLE_PLAN_READER) private readonly plans: BookablePlanReader,
    @Inject(MEMBER_CONTACT_READER) private readonly members: MemberContactReader,
    @Inject(BOOKING_REPOSITORY) private readonly bookings: BookingRepository,
    @Inject(BOOKING_CODE_GENERATOR) private readonly codes: BookingCodeGenerator,
    @Inject(SETTINGS_READER) private readonly settings: SettingsReader,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(userId: string, planId: string): Promise<MemberBookingView> {
    const now = this.clock.now();
    const bookable = await this.plans.find(planId);
    if (bookable === null) throw new PlanNotFoundError(planId);
    if (bookable.gymStatus !== 'PARTNER') throw new GymNotPartnerError();

    const contact = await this.members.find(userId);
    if (contact?.phone == null) throw new PhoneRequiredError();

    const active = await this.bookings.findActive(userId, planId, now);
    if (active !== null) throw new ActiveBookingExistsError(active.id);

    const { codeValidityDays } = await this.settings.get();
    const expiresAt = new Date(now.getTime() + codeValidityDays * MS_PER_DAY);
    // The price is copied now; later price or offer changes never touch this booking.
    const lockedPrice = effectivePrice(bookable.plan, now);
    const offerId = liveOfferOf(bookable.plan, now)?.id ?? null;

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const result = await this.bookings.create({
        code: this.codes.generate().value,
        userId,
        planId,
        offerId,
        lockedPrice,
        expiresAt,
      });
      if ('created' in result) {
        return toMemberBookingView(result.created, now);
      }
    }
    throw new Error('Could not allocate a unique booking code');
  }
}
