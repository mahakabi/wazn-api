import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { REPORT_TYPES, type ReportType } from '../../domain/report-type';

const ID_MAX_LENGTH = 64;
const DETAILS_MAX_LENGTH = 1000;

export class CreateReportDto {
  @ApiProperty({ enum: REPORT_TYPES })
  @IsIn(REPORT_TYPES)
  type!: ReportType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_MAX_LENGTH)
  branchId!: string;

  @ApiPropertyOptional({ description: 'Required for PRICE_MISMATCH' })
  @IsOptional()
  @IsString()
  @MaxLength(ID_MAX_LENGTH)
  bookingId?: string;

  @ApiProperty({ example: 'The desk charged 699 SAR, my code says 599' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(DETAILS_MAX_LENGTH)
  details!: string;
}
