import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { BranchFilterQueryDto } from './branch-filter-query.dto';

const MIN_QUERY = 2;
const MAX_QUERY = 60;

export class SearchQueryDto extends BranchFilterQueryDto {
  @ApiProperty({ example: 'Malqa', description: 'Gym name (EN/AR) or district' })
  @IsString()
  @MinLength(MIN_QUERY)
  @MaxLength(MAX_QUERY)
  q!: string;
}
