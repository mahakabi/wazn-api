import { type CatalogBranch, type CatalogGym, type Gender, type PlanMonths } from './catalog-types';

export interface OfferView {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly wasPrice: number;
  readonly endsAt: Date;
}

export interface PlanView {
  readonly id: string;
  readonly months: PlanMonths;
  /** Regular price; `effectivePrice` is what booking today locks. */
  readonly price: number;
  readonly effectivePrice: number;
  readonly monthlyPrice: number;
  readonly renewalPrice: number;
  readonly joiningFee: number;
  readonly freezeDays: number;
  readonly refundDays: number;
  readonly twelveMonthCost: number;
  readonly verifiedAt: Date;
  readonly verifiedDaysAgo: number;
  readonly isPriceStale: boolean;
  readonly offer: OfferView | null;
}

export interface BranchSummary {
  readonly id: string;
  readonly gym: CatalogGym;
  readonly district: string;
  readonly city: string;
  readonly gender: Gender;
  readonly lat: number;
  readonly lng: number;
  readonly photo: string | null;
  /** Set when the query had a location. */
  readonly distanceMeters: number | null;
  /** Booking (price lock) is only possible with partner gyms. */
  readonly bookable: boolean;
  readonly hasOffer: boolean;
  /** The plan shown on the map pin / list row: the requested duration, else the lowest monthly price. */
  readonly featuredPlan: PlanView | null;
}

export interface BranchDetail extends Omit<BranchSummary, 'featuredPlan' | 'photo'> {
  readonly photos: readonly string[];
  readonly plans: readonly PlanView[];
}

export type { CatalogBranch };
