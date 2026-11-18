import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { toBoolean } from '../../../../common/presentation/query-transforms';
import { DEFAULT_RESULTS, MAX_RESULTS } from '../../application/catalog-limits';
import { type Gender, GENDERS, PLAN_MONTHS, type PlanMonths } from '../../domain/catalog-types';

/** Filters shared by the map (nearby) and the search list. */
export class BranchFilterQueryDto {
  @ApiPropertyOptional({ enum: GENDERS, description: 'WOMEN or MEN also include MIXED gyms' })
  @IsOptional()
  @IsIn(GENDERS)
  gender?: Gender;

  @ApiPropertyOptional({
    enum: PLAN_MONTHS,
    description: 'Show this duration as the featured plan',
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn(PLAN_MONTHS)
  months?: PlanMonths;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  hasOffer?: boolean;

  @ApiPropertyOptional({ default: DEFAULT_RESULTS, maximum: MAX_RESULTS })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_RESULTS)
  limit?: number;
}
