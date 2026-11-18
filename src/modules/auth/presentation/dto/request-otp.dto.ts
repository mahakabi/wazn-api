import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { type MessageLocale } from '../../application/otp-email';
import { MESSAGE_LOCALES, EMAIL_MAX_LENGTH } from './auth-dto.constants';

export class RequestOtpDto {
  @ApiProperty({ example: 'maha@example.com' })
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;

  @ApiPropertyOptional({ enum: MESSAGE_LOCALES, default: 'en' })
  @IsOptional()
  @IsIn(MESSAGE_LOCALES)
  locale?: MessageLocale;
}
