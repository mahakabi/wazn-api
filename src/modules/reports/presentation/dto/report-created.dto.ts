import { ApiProperty } from '@nestjs/swagger';
import { REPORT_TYPES } from '../../domain/report-type';

export class ReportCreatedDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: REPORT_TYPES }) type!: string;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt!: Date;
}
