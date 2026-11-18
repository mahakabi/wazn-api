import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { BookingStatus, Prisma } from '../../../generated/prisma/client';
import {
  type BookingRecord,
  type Confirmation,
  type NewBooking,
  type StaffBookingRecord,
} from '../domain/booking-record';
import {
  type BookingRepository,
  type CreateBookingResult,
} from '../domain/ports/booking-repository';
import {
  bookingInclude,
  staffBookingInclude,
  toBookingRecord,
  toStaffBookingRecord,
} from './prisma-booking.mapper';

const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(booking: NewBooking): Promise<CreateBookingResult> {
    try {
      const row = await this.prisma.booking.create({ data: booking, include: bookingInclude });
      return { created: toBookingRecord(row) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION
      ) {
        return { codeTaken: true };
      }
      throw error;
    }
  }

  async findActive(userId: string, planId: string, now: Date): Promise<BookingRecord | null> {
    const row = await this.prisma.booking.findFirst({
      where: { userId, planId, status: BookingStatus.ISSUED, expiresAt: { gt: now } },
      include: bookingInclude,
    });
    return row ? toBookingRecord(row) : null;
  }

  async listForUser(userId: string): Promise<BookingRecord[]> {
    const rows = await this.prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toBookingRecord);
  }

  async findForUser(bookingId: string, userId: string): Promise<BookingRecord | null> {
    const row = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: bookingInclude,
    });
    return row ? toBookingRecord(row) : null;
  }

  async findByCode(code: string): Promise<StaffBookingRecord | null> {
    const row = await this.prisma.booking.findUnique({
      where: { code },
      include: staffBookingInclude,
    });
    return row ? toStaffBookingRecord(row) : null;
  }

  async cancel(bookingId: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.booking.updateMany({
      where: { id: bookingId, status: BookingStatus.ISSUED, expiresAt: { gt: now } },
      data: { status: BookingStatus.CANCELLED },
    });
    return count === 1;
  }

  async confirm(confirmation: Confirmation): Promise<boolean> {
    // Conditional update = the "one transaction" of the confirm rule: status check and
    // change happen atomically, so two desks can't both confirm the same code.
    const { count } = await this.prisma.booking.updateMany({
      where: {
        id: confirmation.bookingId,
        status: BookingStatus.ISSUED,
        expiresAt: { gt: confirmation.at },
      },
      data: {
        status: BookingStatus.CONFIRMED,
        confirmedAt: confirmation.at,
        confirmedBy: confirmation.staffId,
        commission: new Prisma.Decimal(confirmation.commission),
      },
    });
    return count === 1;
  }

  async expireOverdue(now: Date): Promise<number> {
    const { count } = await this.prisma.booking.updateMany({
      where: { status: BookingStatus.ISSUED, expiresAt: { lte: now } },
      data: { status: BookingStatus.EXPIRED },
    });
    return count;
  }
}
