import { Inject, Injectable } from '@nestjs/common';
import { toBranchSummary } from '../domain/branch-view-builder';
import { type BranchSummary } from '../domain/branch-views';
import { CATALOG_READER, type CatalogReader } from '../domain/catalog-reader';
import { ViewContextProvider } from './view-context.provider';

/** Summaries by id, for other modules (saved gyms). Missing or hidden branches are left out. */
@Injectable()
export class GetBranchSummariesUseCase {
  constructor(
    @Inject(CATALOG_READER) private readonly reader: CatalogReader,
    private readonly contexts: ViewContextProvider,
  ) {}

  async execute(branchIds: readonly string[]): Promise<Map<string, BranchSummary>> {
    if (branchIds.length === 0) return new Map();
    const [branches, context] = await Promise.all([
      this.reader.loadBranches(branchIds),
      this.contexts.current(),
    ]);
    return new Map(branches.map((branch) => [branch.id, toBranchSummary(branch, context)]));
  }
}
