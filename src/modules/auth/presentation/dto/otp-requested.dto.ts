import { ApiProperty } from '@nestjs/swagger';
import { type RequestOtpResult } from '../../application/request-otp.use-case';

export class OtpRequestedDto implements RequestOtpResult {
  @ApiProperty({ example: 300 })
  expiresInSeconds!: number;

  @ApiProperty({ example: 60 })
  resendAfterSeconds!: number;
}
