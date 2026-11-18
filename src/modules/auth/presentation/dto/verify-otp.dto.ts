import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { type MessageLocale } from '../../application/otp-email';
import { MESSAGE_LOCALES, OTP_CODE_PATTERN, EMAIL_MAX_LENGTH } from './auth-dto.constants';

export class VerifyOtpDto {
  @ApiProperty({ example: 'maha@example.com' })
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty({ example: '482913' })
  @Matches(OTP_CODE_PATTERN, { message: 'code must be the digits from the SMS' })
  code!: string;

  @ApiPropertyOptional({
    enum: MESSAGE_LOCALES,
    default: 'en',
    description: 'Saved on the account when it is created',
  })
  @IsOptional()
  @IsIn(MESSAGE_LOCALES)
  locale?: MessageLocale;
}
