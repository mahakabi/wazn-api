import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { Public } from '../../../common/presentation/public.decorator';
import { RefreshSessionUseCase } from '../application/refresh-session.use-case';
import { RequestOtpUseCase, type RequestOtpResult } from '../application/request-otp.use-case';
import { SignOutUseCase } from '../application/sign-out.use-case';
import { VerifyOtpUseCase } from '../application/verify-otp.use-case';
import { type Session } from '../domain/session';
import { OtpRequestedDto } from './dto/otp-requested.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { SessionDto } from './dto/session.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

const DEFAULT_LOCALE = 'en';

@ApiTags('auth')
@Public()
@UseGuards(ThrottlerGuard)
@ApiTooManyRequestsResponse({ type: ApiErrorDto })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestOtp: RequestOtpUseCase,
    private readonly verifyOtp: VerifyOtpUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly signOut: SignOutUseCase,
  ) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OtpRequestedDto })
  @ApiBadRequestResponse({ type: ApiErrorDto, description: 'INVALID_EMAIL, VALIDATION_FAILED' })
  request(@Body() body: RequestOtpDto): Promise<RequestOtpResult> {
    return this.requestOtp.execute({ email: body.email, locale: body.locale ?? DEFAULT_LOCALE });
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto, description: 'INVALID_OTP, OTP_EXPIRED' })
  verify(@Body() body: VerifyOtpDto): Promise<Session> {
    return this.verifyOtp.execute({
      email: body.email,
      code: body.code,
      locale: body.locale ?? DEFAULT_LOCALE,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionDto })
  @ApiUnauthorizedResponse({ type: ApiErrorDto, description: 'INVALID_REFRESH_TOKEN' })
  refresh(@Body() body: RefreshTokenDto): Promise<Session> {
    return this.refreshSession.execute(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    await this.signOut.execute(body.refreshToken);
  }
}
