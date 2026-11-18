import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { Public } from '../../../common/presentation/public.decorator';
import { DEFAULT_RADIUS_KM, DEFAULT_RESULTS } from '../application/catalog-limits';
import { type Comparison, CompareBranchesUseCase } from '../application/compare-branches.use-case';
import { FindNearbyBranchesUseCase } from '../application/find-nearby-branches.use-case';
import { GetBranchDetailUseCase } from '../application/get-branch-detail.use-case';
import { SearchBranchesUseCase } from '../application/search-branches.use-case';
import { type BranchDetail, type BranchSummary } from '../domain/branch-views';
import { BranchDetailDto, BranchSummaryDto, ComparisonDto } from './dto/catalog-response.dto';
import { CompareQueryDto } from './dto/compare-query.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';

/** Public: browsing prices doesn't need an account. */
@ApiTags('catalog')
@Public()
@Controller()
export class CatalogController {
  constructor(
    private readonly findNearby: FindNearbyBranchesUseCase,
    private readonly searchBranches: SearchBranchesUseCase,
    private readonly getDetail: GetBranchDetailUseCase,
    private readonly compareBranches: CompareBranchesUseCase,
  ) {}

  @Get('branches/nearby')
  @ApiOkResponse({ type: [BranchSummaryDto], description: 'Nearest first' })
  nearby(@Query() query: NearbyQueryDto): Promise<BranchSummary[]> {
    return this.findNearby.execute({
      lat: query.lat,
      lng: query.lng,
      gender: query.gender,
      months: query.months,
      hasOffer: query.hasOffer,
      radiusKm: query.radiusKm ?? DEFAULT_RADIUS_KM,
      limit: query.limit ?? DEFAULT_RESULTS,
    });
  }

  @Get('branches/search')
  @ApiOkResponse({ type: [BranchSummaryDto] })
  search(@Query() query: SearchQueryDto): Promise<BranchSummary[]> {
    return this.searchBranches.execute({
      text: query.q,
      gender: query.gender,
      months: query.months,
      hasOffer: query.hasOffer,
      limit: query.limit ?? DEFAULT_RESULTS,
    });
  }

  @Get('branches/:id')
  @ApiOkResponse({ type: BranchDetailDto })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'BRANCH_NOT_FOUND' })
  detail(@Param('id') id: string): Promise<BranchDetail> {
    return this.getDetail.execute(id);
  }

  @Get('compare')
  @ApiOkResponse({ type: ComparisonDto })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'BRANCH_NOT_FOUND' })
  compare(@Query() query: CompareQueryDto): Promise<Comparison> {
    return this.compareBranches.execute(query.ids);
  }
}
