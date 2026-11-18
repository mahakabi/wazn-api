import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { type AccessTokenClaims } from '../../auth/domain/access-token-claims';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { Roles } from '../../auth/presentation/roles.decorator';
import { ConfirmBookingCodeUseCase } from '../application/confirm-booking-code.use-case';
import { VerifyBookingCodeUseCase } from '../application/verify-booking-code.use-case';
import { type StaffBookingView } from '../domain/booking-views';
import { StaffBookingDto } from './dto/booking-response.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

/** Gym portal front desk. Every staff role (owner, branch manager, front desk) can do this. */
@ApiTags('gym portal')
@ApiBearerAuth()
@Roles('GYM_STAFF')
@ApiForbiddenResponse({ type: ApiErrorDto, description: 'FORBIDDEN, NOT_GYM_STAFF' })
@ApiNotFoundResponse({
  type: ApiErrorDto,
  description: "BOOKING_NOT_FOUND (incl. other gyms' codes)",
})
@Controller('gym/codes')
export class GymCodesController {
  constructor(
    private readonly verifyCode: VerifyBookingCodeUseCase,
    private readonly confirmCode: ConfirmBookingCodeUseCase,
  ) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StaffBookingDto })
  verify(
    @CurrentUser() caller: AccessTokenClaims,
    @Body() body: VerifyCodeDto,
  ): Promise<StaffBookingView> {
    return this.verifyCode.execute(caller.userId, body.code);
  }

  @Post(':code/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: StaffBookingDto })
  @ApiUnprocessableEntityResponse({
    type: ApiErrorDto,
    description: 'BOOKING_EXPIRED, BOOKING_CANCELLED',
  })
  @ApiConflictResponse({ type: ApiErrorDto, description: 'BOOKING_ALREADY_CONFIRMED' })
  confirm(
    @CurrentUser() caller: AccessTokenClaims,
    @Param('code') code: string,
  ): Promise<StaffBookingView> {
    return this.confirmCode.execute(caller.userId, code);
  }
}
