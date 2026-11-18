import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MESSAGE_LOCALES } from './auth-dto.constants';

const NAME_MAX_LENGTH = 50;
const PHONE_MAX_LENGTH = 20;

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Sara', description: 'First name only (PDPL)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ enum: MESSAGE_LOCALES })
  @IsOptional()
  @IsIn(MESSAGE_LOCALES)
  locale?: 'en' | 'ar';

  @ApiPropertyOptional({
    example: '0501234567',
    description: 'Saudi mobile; required before booking',
  })
  @IsOptional()
  @IsString()
  @MaxLength(PHONE_MAX_LENGTH)
  phone?: string;

  @ApiPropertyOptional({ description: 'Explicit consent for WhatsApp alerts' })
  @IsOptional()
  @IsBoolean()
  whatsappOptIn?: boolean;
}
