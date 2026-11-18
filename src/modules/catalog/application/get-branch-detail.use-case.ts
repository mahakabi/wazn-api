import { Inject, Injectable } from '@nestjs/common';
import { toBranchDetail } from '../domain/branch-view-builder';
import { type BranchDetail } from '../domain/branch-views';
import { CATALOG_READER, type CatalogReader } from '../domain/catalog-reader';
import { BranchNotFoundError } from '../domain/errors/branch-not-found.error';
import { ViewContextProvider } from './view-context.provider';

@Injectable()
export class GetBranchDetailUseCase {
  constructor(
    @Inject(CATALOG_READER) private readonly reader: CatalogReader,
    private readonly contexts: ViewContextProvider,
  ) {}

  async execute(branchId: string): Promise<BranchDetail> {
    const [branch] = await this.reader.loadBranches([branchId]);
    if (branch === undefined) {
      throw new BranchNotFoundError(branchId);
    }
    return toBranchDetail(branch, await this.contexts.current());
  }
}
