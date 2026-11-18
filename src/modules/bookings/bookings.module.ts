import { Module } from '@nestjs/common';
import { CancelBookingUseCase } from './application/cancel-booking.use-case';
import { ConfirmBookingCodeUseCase } from './application/confirm-booking-code.use-case';
import { CreateBookingUseCase } from './application/create-booking.use-case';
import { ExpireOverdueBookingsUseCase } from './application/expire-overdue-bookings.use-case';
import { GetMyBookingUseCase } from './application/get-my-booking.use-case';
import { ListMyBookingsUseCase } from './application/list-my-bookings.use-case';
import { StaffBookingLookup } from './application/staff-booking-lookup';
import { VerifyBookingCodeUseCase } from './application/verify-booking-code.use-case';
import { BOOKABLE_PLAN_READER } from './domain/ports/bookable-plan-reader';
import { BOOKING_CODE_GENERATOR } from './domain/ports/booking-code-generator';
import { BOOKING_REPOSITORY } from './domain/ports/booking-repository';
import { MEMBER_CONTACT_READER } from './domain/ports/member-contact-reader';
import { STAFF_DIRECTORY } from './domain/ports/staff-directory';
import { BookingExpiryScheduler } from './infrastructure/booking-expiry.scheduler';
import { PrismaBookablePlanReader } from './infrastructure/prisma-bookable-plan.reader';
import { PrismaBookingRepository } from './infrastructure/prisma-booking.repository';
import { PrismaMemberContactReader } from './infrastructure/prisma-member-contact.reader';
import { PrismaStaffDirectory } from './infrastructure/prisma-staff.directory';
import { RandomBookingCodeGenerator } from './infrastructure/random-booking-code.generator';
import { BookingsController } from './presentation/bookings.controller';
import { GymCodesController } from './presentation/gym-codes.controller';

@Module({
  controllers: [BookingsController, GymCodesController],
  providers: [
    CreateBookingUseCase,
    ListMyBookingsUseCase,
    GetMyBookingUseCase,
    CancelBookingUseCase,
    VerifyBookingCodeUseCase,
    ConfirmBookingCodeUseCase,
    ExpireOverdueBookingsUseCase,
    StaffBookingLookup,
    BookingExpiryScheduler,
    { provide: BOOKING_REPOSITORY, useClass: PrismaBookingRepository },
    { provide: BOOKABLE_PLAN_READER, useClass: PrismaBookablePlanReader },
    { provide: MEMBER_CONTACT_READER, useClass: PrismaMemberContactReader },
    { provide: STAFF_DIRECTORY, useClass: PrismaStaffDirectory },
    { provide: BOOKING_CODE_GENERATOR, useClass: RandomBookingCodeGenerator },
  ],
})
export class BookingsModule {}
