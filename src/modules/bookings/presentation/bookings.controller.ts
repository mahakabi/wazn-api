import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { type AccessTokenClaims } from '../../auth/domain/access-token-claims';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { CancelBookingUseCase } from '../application/cancel-booking.use-case';
import { CreateBookingUseCase } from '../application/create-booking.use-case';
import { GetMyBookingUseCase } from '../application/get-my-booking.use-case';
import { ListMyBookingsUseCase } from '../application/list-my-bookings.use-case';
import { type MemberBookingView } from '../domain/booking-views';
import { MemberBookingDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller()
export class BookingsController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly listMyBookings: ListMyBookingsUseCase,
    private readonly getMyBooking: GetMyBookingUseCase,
    private readonly cancelBooking: CancelBookingUseCase,
  ) {}

  @Post('bookings')
  @ApiCreatedResponse({ type: MemberBookingDto })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'PLAN_NOT_FOUND' })
  @ApiUnprocessableEntityResponse({
    type: ApiErrorDto,
    description: 'GYM_NOT_PARTNER, PHONE_REQUIRED',
  })
  @ApiConflictResponse({
    type: ApiErrorDto,
    description: 'ACTIVE_BOOKING_EXISTS (details.bookingId)',
  })
  create(
    @CurrentUser() caller: AccessTokenClaims,
    @Body() body: CreateBookingDto,
  ): Promise<MemberBookingView> {
    return this.createBooking.execute(caller.userId, body.planId);
  }

  @Get('me/bookings')
  @ApiOkResponse({ type: [MemberBookingDto], description: 'Newest first' })
  list(@CurrentUser() caller: AccessTokenClaims): Promise<MemberBookingView[]> {
    return this.listMyBookings.execute(caller.userId);
  }

  @Get('me/bookings/:id')
  @ApiOkResponse({ type: MemberBookingDto })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'BOOKING_NOT_FOUND' })
  get(
    @CurrentUser() caller: AccessTokenClaims,
    @Param('id') id: string,
  ): Promise<MemberBookingView> {
    return this.getMyBooking.execute(caller.userId, id);
  }

  @Post('bookings/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MemberBookingDto })
  @ApiUnprocessableEntityResponse({
    type: ApiErrorDto,
    description: 'BOOKING_EXPIRED, BOOKING_CANCELLED',
  })
  @ApiConflictResponse({ type: ApiErrorDto, description: 'BOOKING_ALREADY_CONFIRMED' })
  cancel(
    @CurrentUser() caller: AccessTokenClaims,
    @Param('id') id: string,
  ): Promise<MemberBookingView> {
    return this.cancelBooking.execute(caller.userId, id);
  }
}
