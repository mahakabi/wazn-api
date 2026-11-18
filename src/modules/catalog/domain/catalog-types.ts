export type Gender = 'WOMEN' | 'MEN' | 'MIXED';
export type GymStatus = 'DRAFT' | 'LISTED' | 'PARTNER';
export type PlanMonths = 1 | 3 | 6 | 12;

export const PLAN_MONTHS: readonly PlanMonths[] = [1, 3, 6, 12];
export const GENDERS: readonly Gender[] = ['WOMEN', 'MEN', 'MIXED'];

export interface CatalogOffer {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly wasPrice: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
}

/** Prices are whole SAR. `offers` holds only approved (LIVE) offers; timing is checked in the domain. */
export interface CatalogPlan {
  readonly id: string;
  readonly months: PlanMonths;
  readonly price: number;
  readonly renewalPrice: number;
  readonly joiningFee: number;
  readonly freezeDays: number;
  readonly refundDays: number;
  readonly verifiedAt: Date;
  readonly offers: readonly CatalogOffer[];
}

export interface CatalogGym {
  readonly id: string;
  readonly nameEn: string;
  readonly nameAr: string;
  readonly status: GymStatus;
}

export interface CatalogBranch {
  readonly id: string;
  readonly gym: CatalogGym;
  readonly district: string;
  readonly city: string;
  readonly gender: Gender;
  readonly lat: number;
  readonly lng: number;
  readonly photos: readonly string[];
  readonly plans: readonly CatalogPlan[];
}
