import { Inject, Injectable } from '@nestjs/common';
import { toBranchDetail } from '../domain/branch-view-builder';
import { type BranchDetail, type PlanView } from '../domain/branch-views';
import { CATALOG_READER, type CatalogReader } from '../domain/catalog-reader';
import { BranchNotFoundError } from '../domain/errors/branch-not-found.error';
import { ViewContextProvider } from './view-context.provider';

export interface ComparedBranch {
  readonly branch: BranchDetail;
  /** The plan with the lowest 12-month cost at this branch. */
  readonly cheapestPlan: PlanView | null;
}

export interface Comparison {
  readonly branches: readonly ComparedBranch[];
  /** Branch whose cheapest plan costs least over 12 months (ties: first requested). */
  readonly bestValueBranchId: string | null;
}

function cheapestOf(plans: readonly PlanView[]): PlanView | null {
  return plans.reduce<PlanView | null>(
    (best, plan) => (best === null || plan.twelveMonthCost < best.twelveMonthCost ? plan : best),
    null,
  );
}

@Injectable()
export class CompareBranchesUseCase {
  constructor(
    @Inject(CATALOG_READER) private readonly reader: CatalogReader,
    private readonly contexts: ViewContextProvider,
  ) {}

  async execute(branchIds: readonly string[]): Promise<Comparison> {
    const unique = [...new Set(branchIds)];
    const [branches, context] = await Promise.all([
      this.reader.loadBranches(unique),
      this.contexts.current(),
    ]);
    const byId = new Map(branches.map((branch) => [branch.id, branch]));

    const compared = unique.map((id): ComparedBranch => {
      const branch = byId.get(id);
      if (branch === undefined) throw new BranchNotFoundError(id);
      const detail = toBranchDetail(branch, context);
      return { branch: detail, cheapestPlan: cheapestOf(detail.plans) };
    });

    const best = compared.reduce<ComparedBranch | null>((winner, entry) => {
      if (entry.cheapestPlan === null) return winner;
      if (winner?.cheapestPlan == null) return entry;
      return entry.cheapestPlan.twelveMonthCost < winner.cheapestPlan.twelveMonthCost
        ? entry
        : winner;
    }, null);

    return { branches: compared, bestValueBranchId: best?.branch.id ?? null };
  }
}
