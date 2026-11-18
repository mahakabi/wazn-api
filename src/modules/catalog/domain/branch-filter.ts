import { type BranchSummary } from './branch-views';
import { type PlanMonths } from './catalog-types';

export interface BranchFilter {
  readonly months?: PlanMonths;
  readonly hasOffer?: boolean;
}

/** A requested duration must exist at the branch; "has offer" applies to that duration if given. */
export function matchesFilter(summary: BranchSummary, filter: BranchFilter): boolean {
  if (filter.months !== undefined && summary.featuredPlan === null) {
    return false;
  }
  if (filter.hasOffer === true) {
    return filter.months !== undefined
      ? (summary.featuredPlan?.offer ?? null) !== null
      : summary.hasOffer;
  }
  return true;
}
