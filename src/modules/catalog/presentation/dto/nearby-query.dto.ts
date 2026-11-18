import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_RADIUS_KM, MAX_RADIUS_KM } from '../../application/catalog-limits';
import { BranchFilterQueryDto } from './branch-filter-query.dto';

const MIN_RADIUS_KM = 0.5;

export class NearbyQueryDto extends BranchFilterQueryDto {
  @ApiProperty({ example: 24.81 })
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: 46.62 })
  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @ApiPropertyOptional({ default: DEFAULT_RADIUS_KM, maximum: MAX_RADIUS_KM })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_RADIUS_KM)
  @Max(MAX_RADIUS_KM)
  radiusKm?: number;
}
