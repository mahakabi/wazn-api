import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';
import { toStringList } from '../../../../common/presentation/query-transforms';
import { MAX_COMPARE } from '../../application/catalog-limits';

const MIN_COMPARE = 2;

export class CompareQueryDto {
  @ApiProperty({
    type: String,
    example: 'branchA,branchB',
    description: 'Comma-separated branch ids',
  })
  @Transform(toStringList)
  @IsArray()
  @ArrayMinSize(MIN_COMPARE)
  @ArrayMaxSize(MAX_COMPARE)
  @IsString({ each: true })
  ids!: string[];
}
