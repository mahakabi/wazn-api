import { type CatalogPlan } from './catalog-types';
import {
  daysSince,
  effectivePrice,
  isPriceStale,
  liveOfferOf,
  monthlyPrice,
  twelveMonthCost,
} from './plan-pricing';

const NOW = new Date('2026-11-18T12:00:00Z');
const day = (offset: number) => new Date(NOW.getTime() + offset * 24 * 60 * 60 * 1000);

function plan(overrides: Partial<CatalogPlan> = {}): CatalogPlan {
  return {
    id: 'p1',
    months: 3,
    price: 900,
    renewalPrice: 1000,
    joiningFee: 150,
    freezeDays: 7,
    refundDays: 3,
    verifiedAt: day(-5),
    offers: [],
    ...overrides,
  };
}

const offer = (startsAt: Date, endsAt: Date) => ({
  id: 'o1',
  title: 'Winter',
  price: 600,
  wasPrice: 900,
  startsAt,
  endsAt,
});

describe('plan pricing', () => {
  it('uses the offer price only while the offer window is open', () => {
    expect(effectivePrice(plan({ offers: [offer(day(-1), day(1))] }), NOW)).toBe(600);
    expect(effectivePrice(plan({ offers: [offer(day(1), day(5))] }), NOW)).toBe(900);
    expect(effectivePrice(plan({ offers: [offer(day(-5), NOW)] }), NOW)).toBe(900);
    expect(liveOfferOf(plan(), NOW)).toBeNull();
  });

  it('computes the 12-month cost: joining + first term + renewals', () => {
    // 3-month plan → 1 first term + 3 renewals.
    expect(twelveMonthCost(plan(), NOW)).toBe(150 + 900 + 3 * 1000);
    // Offer lowers only the first term.
    expect(twelveMonthCost(plan({ offers: [offer(day(-1), day(1))] }), NOW)).toBe(
      150 + 600 + 3 * 1000,
    );
    // Annual plan has no renewal inside the year.
    expect(twelveMonthCost(plan({ months: 12, price: 2500, renewalPrice: 2800 }), NOW)).toBe(
      150 + 2500,
    );
  });

  it('shows cheaper-today plans can cost more over a year', () => {
    const cheapToday = plan({ months: 1, price: 199, renewalPrice: 349, joiningFee: 200 });
    const annual = plan({ months: 12, price: 3300, renewalPrice: 3300, joiningFee: 0 });

    expect(twelveMonthCost(cheapToday, NOW)).toBe(200 + 199 + 11 * 349);
    expect(twelveMonthCost(cheapToday, NOW)).toBeGreaterThan(twelveMonthCost(annual, NOW));
  });

  it('rounds the monthly price for display', () => {
    expect(monthlyPrice(807, 3)).toBe(269);
    expect(monthlyPrice(2499, 12)).toBe(208);
  });

  it('flags prices verified more than N days ago', () => {
    expect(daysSince(day(-30), NOW)).toBe(30);
    expect(isPriceStale(plan({ verifiedAt: day(-30) }), NOW, 30)).toBe(false);
    expect(isPriceStale(plan({ verifiedAt: day(-31) }), NOW, 30)).toBe(true);
  });
});
