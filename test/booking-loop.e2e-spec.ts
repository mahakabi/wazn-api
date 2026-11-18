import { E2eContext } from './e2e-context';

const MEMBER = 'e2e.booker@wazn.test';
const NO_PHONE_MEMBER = 'e2e.nophone@wazn.test';
const MEMBER_PHONE = '0599000002';
const PULSE_MALQA_3M = 'seed_branch_pulse_malqa_m3'; // live offer: 599 SAR
const IRON_YARD_1M = 'seed_branch_ironyard_yasmin_m1'; // LISTED gym: not bookable

interface Booking {
  id: string;
  code: string;
  status: string;
  lockedPrice: number;
  offerApplied: boolean;
}

describe('Booking loop (e2e): book → verify → confirm', () => {
  let ctx: E2eContext;
  let member: string;
  let desk: string;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    ctx = await E2eContext.start();
    await ctx.deleteMembers([MEMBER, NO_PHONE_MEMBER]);
    member = await ctx.signIn(MEMBER);
    desk = await ctx.signIn('malqa.desk@pulse.test');
    await ctx
      .http()
      .patch('/v1/me')
      .set(auth(member))
      .send({ name: 'Noura', phone: MEMBER_PHONE, whatsappOptIn: true })
      .expect(200);
  });

  afterAll(async () => {
    try {
      await ctx.deleteMembers([MEMBER, NO_PHONE_MEMBER]);
    } finally {
      await ctx.stop();
    }
  });

  it('locks the offer price, then the front desk confirms and commission is recorded', async () => {
    const created = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: PULSE_MALQA_3M })
      .expect(201);
    const booking = created.body as Booking;
    expect(booking).toMatchObject({ status: 'ISSUED', lockedPrice: 599, offerApplied: true });
    expect(booking.code).toMatch(/^WZ-[A-HJ-NP-Z2-9]{4}$/);

    const verified = await ctx
      .http()
      .post('/v1/gym/codes/verify')
      .set(auth(desk))
      .send({ code: booking.code.toLowerCase() })
      .expect(200);
    expect(verified.body).toMatchObject({
      status: 'ISSUED',
      memberFirstName: 'Noura',
      memberMaskedPhone: '05XX XXX 002',
      lockedPrice: 599,
    });

    await ctx.http().post(`/v1/gym/codes/${booking.code}/confirm`).set(auth(desk)).expect(200);

    const stored = await ctx.prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(stored.status).toBe('CONFIRMED');
    expect(stored.commission?.toString()).toBe('59.9');

    const again = await ctx
      .http()
      .post(`/v1/gym/codes/${booking.code}/confirm`)
      .set(auth(desk))
      .expect(409);
    expect(again.body).toMatchObject({ code: 'BOOKING_ALREADY_CONFIRMED' });

    const mine = await ctx.http().get('/v1/me/bookings').set(auth(member)).expect(200);
    expect((mine.body as Booking[])[0]).toMatchObject({ id: booking.id, status: 'CONFIRMED' });
  });

  it("keeps other branches' staff out", async () => {
    const created = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: 'seed_branch_pulse_malqa_m1' })
      .expect(201);
    const manager = await ctx.signIn('hittin.manager@pulse.test');

    await ctx
      .http()
      .post('/v1/gym/codes/verify')
      .set(auth(manager))
      .send({ code: (created.body as Booking).code })
      .expect(404);
    await ctx
      .http()
      .post('/v1/gym/codes/verify')
      .set(auth(member))
      .send({ code: (created.body as Booking).code })
      .expect(403);
  });

  it('lets the member cancel an issued booking, once', async () => {
    const created = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: 'seed_branch_pulse_malqa_m6' })
      .expect(201);
    const { id } = created.body as Booking;

    await ctx.http().post(`/v1/bookings/${id}/cancel`).set(auth(member)).expect(200);
    const again = await ctx.http().post(`/v1/bookings/${id}/cancel`).set(auth(member)).expect(422);
    expect(again.body).toMatchObject({ code: 'BOOKING_CANCELLED' });
  });

  it('refuses a second active booking for the same plan', async () => {
    await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: 'seed_branch_pulse_malqa_m12' })
      .expect(201);

    const second = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: 'seed_branch_pulse_malqa_m12' })
      .expect(409);
    expect(second.body).toMatchObject({ code: 'ACTIVE_BOOKING_EXISTS' });
  });

  it('only books partner gyms', async () => {
    const response = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(member))
      .send({ planId: IRON_YARD_1M })
      .expect(422);
    expect(response.body).toMatchObject({ code: 'GYM_NOT_PARTNER' });
  });

  it('asks for a phone before the first booking', async () => {
    const token = await ctx.signIn(NO_PHONE_MEMBER);

    const response = await ctx
      .http()
      .post('/v1/bookings')
      .set(auth(token))
      .send({ planId: PULSE_MALQA_3M })
      .expect(422);
    expect(response.body).toMatchObject({ code: 'PHONE_REQUIRED' });
  });
});
