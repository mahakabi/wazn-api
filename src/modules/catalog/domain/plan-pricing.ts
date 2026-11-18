import { type CatalogOffer, type CatalogPlan } from './catalog-types';

const MONTHS_PER_YEAR = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** An approved offer counts only inside its [startsAt, endsAt) window. */
export function liveOfferOf(plan: CatalogPlan, now: Date): CatalogOffer | null {
  const time = now.getTime();
  return (
    plan.offers.find(
      (offer) => offer.startsAt.getTime() <= time && time < offer.endsAt.getTime(),
    ) ?? null
  );
}

/** What the member pays for the first term today: the offer price if one is live. */
export function effectivePrice(plan: CatalogPlan, now: Date): number {
  return liveOfferOf(plan, now)?.price ?? plan.price;
}

/** "That's X SAR a month". Rounded to whole SAR for display only, never for charging. */
export function monthlyPrice(price: number, months: number): number {
  return Math.round(price / months);
}

/**
 * Business rule #11: joining fee + first-term price + renewal price for the rest of the
 * 12 months. A 3-month plan is 1 first term + 3 renewals.
 */
export function twelveMonthCost(plan: CatalogPlan, now: Date): number {
  const termsPerYear = MONTHS_PER_YEAR / plan.months;
  return plan.joiningFee + effectivePrice(plan, now) + plan.renewalPrice * (termsPerYear - 1);
}

export function daysSince(date: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY));
}

/** Business rule #6: older than the freshness window → warn the member, queue for admin. */
export function isPriceStale(plan: CatalogPlan, now: Date, freshnessDays: number): boolean {
  return daysSince(plan.verifiedAt, now) > freshnessDays;
}
