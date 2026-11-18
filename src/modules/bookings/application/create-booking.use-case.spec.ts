import { FixedClock } from '../../../common/testing/fixed-clock';
import { type BookablePlan } from '../domain/bookable-plan';
import { ActiveBookingExistsError } from '../domain/errors/active-booking-exists.error';
import { GymNotPartnerError } from '../domain/errors/gym-not-partner.error';
import { PhoneRequiredError } from '../domain/errors/phone-required.error';
import { PlanNotFoundError } from '../domain/errors/plan-not-found.error';
import { CreateBookingUseCase } from './create-booking.use-case';
import {
  ScriptedCodeGenerator,
  StubBookablePlanReader,
  StubMemberContactReader,
  StubSettingsReader,
} from './testing/booking-fakes';
import { InMemoryBookingRepository } from './testing/in-memory-booking.repository';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const PLACE = {
  branchId: 'br1',
  district: 'Al Malqa',
  gymId: 'gym1',
  gymNameEn: 'Pulse',
  gymNameAr: 'بلس',
};

function bookable(overrides: Partial<BookablePlan> = {}): BookablePlan {
  return {
    gymStatus: 'PARTNER',
    place: PLACE,
    plan: {
      id: 'plan3',
      months: 3,
      price: 807,
      renewalPrice: 928,
      joiningFee: 150,
      freezeDays: 7,
      refundDays: 3,
      verifiedAt: new Date(NOW.getTime() - DAY),
      offers: [
        {
          id: 'offer1',
          title: 'Winter',
          price: 599,
          wasPrice: 807,
          startsAt: new Date(NOW.getTime() - DAY),
          endsAt: new Date(NOW.getTime() + DAY),
        },
      ],
    },
    ...overrides,
  };
}

describe('CreateBookingUseCase', () => {
  let plans: StubBookablePlanReader;
  let members: StubMemberContactReader;
  let bookings: InMemoryBookingRepository;
  let codes: ScriptedCodeGenerator;
  let useCase: CreateBookingUseCase;

  beforeEach(() => {
    plans = new StubBookablePlanReader(bookable());
    members = new StubMemberContactReader({ phone: '+966501234567' });
    bookings = new InMemoryBookingRepository(PLACE, { name: 'Sara', phone: '+966501234567' });
    codes = new ScriptedCodeGenerator(['7K42', '8M3P']);
    useCase = new CreateBookingUseCase(
      plans,
      members,
      bookings,
      codes,
      new StubSettingsReader(),
      new FixedClock(NOW),
    );
  });

  it('locks the live offer price and issues a 7-day code', async () => {
    const booking = await useCase.execute('user1', 'plan3');

    expect(booking).toMatchObject({
      code: 'WZ-7K42',
      qrPayload: 'WZ-7K42',
      status: 'ISSUED',
      lockedPrice: 599,
      offerApplied: true,
    });
    expect(booking.expiresAt.toISOString()).toBe('2026-11-25T12:00:00.000Z');
  });

  it('locks the regular price when no offer is live', async () => {
    plans.plan = bookable({ plan: { ...bookable().plan, offers: [] } });

    const booking = await useCase.execute('user1', 'plan3');

    expect(booking).toMatchObject({ lockedPrice: 807, offerApplied: false });
  });

  it('retries with a new code on collision', async () => {
    bookings.takenCodes.add('WZ-7K42');

    await expect(useCase.execute('user1', 'plan3')).resolves.toMatchObject({ code: 'WZ-8M3P' });
  });

  it('only books partner gyms', async () => {
    plans.plan = bookable({ gymStatus: 'LISTED' });

    await expect(useCase.execute('user1', 'plan3')).rejects.toBeInstanceOf(GymNotPartnerError);
  });

  it('requires a phone first', async () => {
    members.contact = { phone: null };

    await expect(useCase.execute('user1', 'plan3')).rejects.toBeInstanceOf(PhoneRequiredError);
  });

  it('refuses a second active booking for the same plan', async () => {
    const first = await useCase.execute('user1', 'plan3');

    await expect(useCase.execute('user1', 'plan3')).rejects.toMatchObject({
      code: 'ACTIVE_BOOKING_EXISTS',
      details: { bookingId: first.id },
    });
    await expect(useCase.execute('user1', 'plan3')).rejects.toBeInstanceOf(
      ActiveBookingExistsError,
    );
  });

  it('fails for an unknown plan', async () => {
    plans.plan = null;

    await expect(useCase.execute('user1', 'nope')).rejects.toBeInstanceOf(PlanNotFoundError);
  });
});
