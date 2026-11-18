import { FixedClock } from '../../../common/testing/fixed-clock';
import { BookingAlreadyConfirmedError } from '../domain/errors/booking-already-confirmed.error';
import { BookingCancelledError } from '../domain/errors/booking-cancelled.error';
import { BookingExpiredError } from '../domain/errors/booking-expired.error';
import { BookingNotFoundError } from '../domain/errors/booking-not-found.error';
import { NotGymStaffError } from '../domain/errors/not-gym-staff.error';
import { CancelBookingUseCase } from './cancel-booking.use-case';
import { ConfirmBookingCodeUseCase } from './confirm-booking-code.use-case';
import { StaffBookingLookup } from './staff-booking-lookup';
import { StubSettingsReader, StubStaffDirectory } from './testing/booking-fakes';
import { InMemoryBookingRepository } from './testing/in-memory-booking.repository';
import { VerifyBookingCodeUseCase } from './verify-booking-code.use-case';

const NOW = new Date('2026-11-18T12:00:00Z');
const PLACE = {
  branchId: 'br1',
  district: 'Al Malqa',
  gymId: 'gym1',
  gymNameEn: 'Pulse',
  gymNameAr: 'بلس',
};

describe('Front desk: verify + confirm', () => {
  let clock: FixedClock;
  let bookings: InMemoryBookingRepository;
  let staff: StubStaffDirectory;
  let settings: StubSettingsReader;
  let verify: VerifyBookingCodeUseCase;
  let confirm: ConfirmBookingCodeUseCase;

  async function issue(gymRate: string | null = null): Promise<void> {
    bookings = new InMemoryBookingRepository(
      PLACE,
      { name: 'Sara', phone: '+966501234412' },
      gymRate,
    );
    await bookings.create({
      code: 'WZ-7K42',
      userId: 'member1',
      planId: 'plan3',
      offerId: null,
      lockedPrice: 599,
      expiresAt: new Date(NOW.getTime() + 60_000),
    });
    const lookup = new StaffBookingLookup(bookings, staff);
    verify = new VerifyBookingCodeUseCase(lookup, clock);
    confirm = new ConfirmBookingCodeUseCase(lookup, bookings, settings, clock);
  }

  beforeEach(async () => {
    clock = new FixedClock(NOW);
    staff = new StubStaffDirectory([{ staffId: 'staff1', gymId: 'gym1', branchId: 'br1' }]);
    settings = new StubSettingsReader();
    await issue();
  });

  it('shows the desk a masked phone and first name', async () => {
    await expect(verify.execute('desk', '7k42')).resolves.toMatchObject({
      code: 'WZ-7K42',
      status: 'ISSUED',
      lockedPrice: 599,
      memberFirstName: 'Sara',
      memberMaskedPhone: '05XX XXX 412',
    });
  });

  it('confirms with the default commission and records who confirmed', async () => {
    const result = await confirm.execute('desk', 'WZ-7K42');

    expect(result.status).toBe('CONFIRMED');
    expect(bookings.rows[0]).toMatchObject({
      status: 'CONFIRMED',
      commission: '59.90',
      confirmedBy: 'staff1',
      confirmedAt: NOW,
    });
  });

  it("uses the gym's own rate when set", async () => {
    await issue('0.080');

    await confirm.execute('desk', 'WZ-7K42');

    expect(bookings.rows[0]?.commission).toBe('47.92');
  });

  it('cannot confirm twice', async () => {
    await confirm.execute('desk', 'WZ-7K42');

    await expect(confirm.execute('desk', 'WZ-7K42')).rejects.toBeInstanceOf(
      BookingAlreadyConfirmedError,
    );
  });

  it('cannot confirm after expiry, even before the expiry job runs', async () => {
    clock.advanceSeconds(60);

    await expect(confirm.execute('desk', 'WZ-7K42')).rejects.toBeInstanceOf(BookingExpiredError);
    await expect(verify.execute('desk', 'WZ-7K42')).resolves.toMatchObject({ status: 'EXPIRED' });
  });

  it('cannot confirm a cancelled booking', async () => {
    await new CancelBookingUseCase(bookings, clock).execute('member1', 'b1');

    await expect(confirm.execute('desk', 'WZ-7K42')).rejects.toBeInstanceOf(BookingCancelledError);
  });

  it("hides other branches' codes as not found", async () => {
    staff.memberships = [{ staffId: 'staff2', gymId: 'gym1', branchId: 'br2' }];

    await expect(verify.execute('desk', 'WZ-7K42')).rejects.toBeInstanceOf(BookingNotFoundError);
  });

  it('rejects users without a staff record', async () => {
    staff.memberships = [];

    await expect(verify.execute('desk', 'WZ-7K42')).rejects.toBeInstanceOf(NotGymStaffError);
  });
});
