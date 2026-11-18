import { ApiProperty } from '@nestjs/swagger';
import { BranchSummaryDto } from '../../../catalog/presentation/dto/catalog-response.dto';
import { ALERT_MODES } from '../../domain/alert-mode';

export class SavedGymDto {
  @ApiProperty({ type: BranchSummaryDto }) branch!: BranchSummaryDto;
  @ApiProperty({ enum: ALERT_MODES }) alertMode!: string;
  @ApiProperty({ type: Number, nullable: true }) alertBelow!: number | null;
  @ApiProperty({ type: String, format: 'date-time' }) savedAt!: Date;
}
