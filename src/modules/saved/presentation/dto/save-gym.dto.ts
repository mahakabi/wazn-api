import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min, ValidateIf } from 'class-validator';
import { ALERT_MODES, type AlertMode } from '../../domain/alert-mode';

export class SaveGymDto {
  @ApiProperty({ enum: ALERT_MODES, default: 'ANY_OFFER' })
  @IsIn(ALERT_MODES)
  alertMode!: AlertMode;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Whole SAR; required for BELOW_PRICE',
  })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsInt()
  @Min(1)
  alertBelow?: number | null;
}
