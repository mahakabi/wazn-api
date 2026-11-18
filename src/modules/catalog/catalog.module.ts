import { Module } from '@nestjs/common';
import { CompareBranchesUseCase } from './application/compare-branches.use-case';
import { FindNearbyBranchesUseCase } from './application/find-nearby-branches.use-case';
import { GetBranchDetailUseCase } from './application/get-branch-detail.use-case';
import { GetBranchSummariesUseCase } from './application/get-branch-summaries.use-case';
import { SearchBranchesUseCase } from './application/search-branches.use-case';
import { ViewContextProvider } from './application/view-context.provider';
import { CATALOG_READER } from './domain/catalog-reader';
import { PrismaCatalogReader } from './infrastructure/prisma-catalog.reader';
import { CatalogController } from './presentation/catalog.controller';

@Module({
  controllers: [CatalogController],
  providers: [
    FindNearbyBranchesUseCase,
    SearchBranchesUseCase,
    GetBranchDetailUseCase,
    GetBranchSummariesUseCase,
    CompareBranchesUseCase,
    ViewContextProvider,
    { provide: CATALOG_READER, useClass: PrismaCatalogReader },
  ],
  exports: [GetBranchSummariesUseCase],
})
export class CatalogModule {}
