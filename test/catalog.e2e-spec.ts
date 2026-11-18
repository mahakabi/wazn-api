import { E2eContext } from './e2e-context';

interface Summary {
  id: string;
  gym: { nameEn: string };
  distanceMeters: number | null;
  bookable: boolean;
  featuredPlan: { months: number; effectivePrice: number; offer: { price: number } | null } | null;
}

// Seed: Pulse Fitness Al Malqa (men, partner, 3-month offer 599) is ~0.5 km from this point.
const MALQA = { lat: 24.81, lng: 46.62 };

describe('Catalog (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await E2eContext.start();
  });

  afterAll(async () => {
    await ctx.stop();
  });

  it('lists nearby gyms nearest first, without signing in', async () => {
    const response = await ctx.http().get('/v1/branches/nearby').query(MALQA).expect(200);
    const branches = response.body as Summary[];

    expect(branches[0]?.gym.nameEn).toBe('Pulse Fitness');
    const distances = branches.map((branch) => branch.distanceMeters ?? 0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('filters by duration + offer and features that plan', async () => {
    const response = await ctx
      .http()
      .get('/v1/branches/nearby')
      .query({ ...MALQA, months: 3, hasOffer: true })
      .expect(200);
    const branches = response.body as Summary[];

    expect(branches.map((branch) => branch.gym.nameEn)).toEqual(['Pulse Fitness']);
    expect(branches[0]?.featuredPlan).toMatchObject({
      months: 3,
      effectivePrice: 599,
      offer: { price: 599 },
    });
  });

  it('returns plan terms, freshness and 12-month cost on the gym page', async () => {
    const response = await ctx.http().get('/v1/branches/seed_branch_ironyard_yasmin').expect(200);
    const detail = response.body as {
      bookable: boolean;
      plans: { months: number; isPriceStale: boolean; twelveMonthCost: number }[];
    };

    expect(detail.bookable).toBe(false);
    expect(detail.plans.map((plan) => plan.months)).toEqual([1, 3, 6, 12]);
    expect(detail.plans.every((plan) => plan.isPriceStale)).toBe(true);
  });

  it('compares 12-month cost across gyms', async () => {
    const response = await ctx
      .http()
      .get('/v1/compare')
      .query({ ids: 'seed_branch_pulse_malqa,seed_branch_lumina_narjis' })
      .expect(200);

    expect(response.body).toMatchObject({ bestValueBranchId: expect.any(String) as string });
  });

  it('searches names in Arabic', async () => {
    const response = await ctx.http().get('/v1/branches/search').query({ q: 'لومينا' }).expect(200);

    expect((response.body as Summary[]).map((branch) => branch.gym.nameEn)).toEqual([
      'Lumina Ladies Club',
    ]);
  });
});
