import { type BranchDetail, type BranchSummary, type PlanView } from './branch-views';
import { type CatalogBranch, type CatalogPlan, type PlanMonths } from './catalog-types';
import {
  daysSince,
  effectivePrice,
  isPriceStale,
  liveOfferOf,
  monthlyPrice,
  twelveMonthCost,
} from './plan-pricing';

export interface ViewContext {
  readonly now: Date;
  readonly priceFreshnessDays: number;
}

export function toPlanView(plan: CatalogPlan, context: ViewContext): PlanView {
  const offer = liveOfferOf(plan, context.now);
  const price = effectivePrice(plan, context.now);
  return {
    id: plan.id,
    months: plan.months,
    price: plan.price,
    effectivePrice: price,
    monthlyPrice: monthlyPrice(price, plan.months),
    renewalPrice: plan.renewalPrice,
    joiningFee: plan.joiningFee,
    freezeDays: plan.freezeDays,
    refundDays: plan.refundDays,
    twelveMonthCost: twelveMonthCost(plan, context.now),
    verifiedAt: plan.verifiedAt,
    verifiedDaysAgo: daysSince(plan.verifiedAt, context.now),
    isPriceStale: isPriceStale(plan, context.now, context.priceFreshnessDays),
    offer: offer && {
      id: offer.id,
      title: offer.title,
      price: offer.price,
      wasPrice: offer.wasPrice,
      endsAt: offer.endsAt,
    },
  };
}

function planViews(branch: CatalogBranch, context: ViewContext): PlanView[] {
  return [...branch.plans]
    .sort((a, b) => a.months - b.months)
    .map((plan) => toPlanView(plan, context));
}

function featuredPlan(plans: readonly PlanView[], months: PlanMonths | undefined): PlanView | null {
  if (months !== undefined) {
    return plans.find((plan) => plan.months === months) ?? null;
  }
  return plans.reduce<PlanView | null>(
    (best, plan) => (best === null || plan.monthlyPrice < best.monthlyPrice ? plan : best),
    null,
  );
}

export function toBranchSummary(
  branch: CatalogBranch,
  context: ViewContext,
  options: { months?: PlanMonths; distanceMeters?: number | null } = {},
): BranchSummary {
  const plans = planViews(branch, context);
  return {
    id: branch.id,
    gym: branch.gym,
    district: branch.district,
    city: branch.city,
    gender: branch.gender,
    lat: branch.lat,
    lng: branch.lng,
    photo: branch.photos[0] ?? null,
    distanceMeters: options.distanceMeters ?? null,
    bookable: branch.gym.status === 'PARTNER',
    hasOffer: plans.some((plan) => plan.offer !== null),
    featuredPlan: featuredPlan(plans, options.months),
  };
}

export function toBranchDetail(branch: CatalogBranch, context: ViewContext): BranchDetail {
  const plans = planViews(branch, context);
  return {
    id: branch.id,
    gym: branch.gym,
    district: branch.district,
    city: branch.city,
    gender: branch.gender,
    lat: branch.lat,
    lng: branch.lng,
    photos: branch.photos,
    distanceMeters: null,
    bookable: branch.gym.status === 'PARTNER',
    hasOffer: plans.some((plan) => plan.offer !== null),
    plans,
  };
}
