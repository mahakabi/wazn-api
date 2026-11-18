import { type BookablePlan } from '../bookable-plan';

export interface BookablePlanReader {
  /** The plan with its approved offers and where it is; null if unknown or the gym is hidden. */
  find(planId: string): Promise<BookablePlan | null>;
}

export const BOOKABLE_PLAN_READER = Symbol('BOOKABLE_PLAN_READER');
