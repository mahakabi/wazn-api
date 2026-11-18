import { E2eContext } from './e2e-context';

const MEMBER = 'e2e.saver@wazn.test';
const BRANCH = 'seed_branch_lumina_narjis';

describe('Saved gyms + reports (e2e)', () => {
  let ctx: E2eContext;
  let token: string;

  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    ctx = await E2eContext.start();
    await ctx.deleteMembers([MEMBER]);
    token = await ctx.signIn(MEMBER);
  });

  afterAll(async () => {
    try {
      await ctx.deleteMembers([MEMBER]);
    } finally {
      await ctx.stop();
    }
  });

  it('saves a gym with a price alert, updates it, and removes it', async () => {
    await ctx
      .http()
      .put(`/v1/me/saved/${BRANCH}`)
      .set(auth())
      .send({ alertMode: 'BELOW_PRICE', alertBelow: 300 })
      .expect(200);

    const missing = await ctx
      .http()
      .put(`/v1/me/saved/${BRANCH}`)
      .set(auth())
      .send({ alertMode: 'BELOW_PRICE' })
      .expect(400);
    expect(missing.body).toMatchObject({ code: 'ALERT_BELOW_REQUIRED' });

    const list = await ctx.http().get('/v1/me/saved').set(auth()).expect(200);
    expect(list.body).toMatchObject([
      { branch: { id: BRANCH }, alertMode: 'BELOW_PRICE', alertBelow: 300 },
    ]);

    await ctx.http().delete(`/v1/me/saved/${BRANCH}`).set(auth()).expect(204);
    const after = await ctx.http().get('/v1/me/saved').set(auth()).expect(200);
    expect(after.body).toEqual([]);
  });

  it('files an outdated-price report and requires a booking for a price mismatch', async () => {
    await ctx
      .http()
      .post('/v1/reports')
      .set(auth())
      .send({ type: 'OUTDATED_PRICE', branchId: BRANCH, details: 'Now 399 on Instagram' })
      .expect(201);

    const mismatch = await ctx
      .http()
      .post('/v1/reports')
      .set(auth())
      .send({ type: 'PRICE_MISMATCH', branchId: BRANCH, details: 'Charged more' })
      .expect(400);
    expect(mismatch.body).toMatchObject({ code: 'BOOKING_REQUIRED' });
  });
});
