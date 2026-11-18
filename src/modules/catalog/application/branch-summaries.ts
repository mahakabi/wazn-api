import { type BranchFilter, matchesFilter } from '../domain/branch-filter';
import { toBranchSummary, type ViewContext } from '../domain/branch-view-builder';
import { type BranchSummary } from '../domain/branch-views';
import { type CatalogReader, type BranchHit } from '../domain/catalog-reader';

/** Loads hits, keeps their order, builds summaries and applies the plan-level filters. */
export async function summariesForHits(
  reader: CatalogReader,
  hits: readonly BranchHit[],
  context: ViewContext,
  filter: BranchFilter,
  limit: number,
): Promise<BranchSummary[]> {
  const branches = await reader.loadBranches(hits.map((hit) => hit.branchId));
  const byId = new Map(branches.map((branch) => [branch.id, branch]));
  const summaries: BranchSummary[] = [];
  for (const hit of hits) {
    const branch = byId.get(hit.branchId);
    if (branch === undefined) continue;
    const summary = toBranchSummary(branch, context, {
      months: filter.months,
      distanceMeters: hit.distanceMeters,
    });
    if (matchesFilter(summary, filter)) summaries.push(summary);
    if (summaries.length === limit) break;
  }
  return summaries;
}
