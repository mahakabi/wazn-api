import { type Prisma } from '../../../generated/prisma/client';
import { type BookingRecord, type StaffBookingRecord } from '../domain/booking-record';

export const bookingInclude = {
  plan: { select: { months: true, branch: { include: { gym: true } } } },
} satisfies Prisma.BookingInclude;

export const staffBookingInclude = {
  ...bookingInclude,
  user: { select: { name: true, phone: true } },
} satisfies Prisma.BookingInclude;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;
type StaffBookingRow = Prisma.BookingGetPayload<{ include: typeof staffBookingInclude }>;

export function toBookingRecord(row: BookingRow): BookingRecord {
  const { branch } = row.plan;
  return {
    id: row.id,
    code: row.code,
    userId: row.userId,
    planId: row.planId,
    planMonths: row.plan.months,
    offerId: row.offerId,
    lockedPrice: row.lockedPrice,
    status: row.status,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    confirmedAt: row.confirmedAt,
    place: {
      branchId: branch.id,
      district: branch.district,
      gymId: branch.gym.id,
      gymNameEn: branch.gym.nameEn,
      gymNameAr: branch.gym.nameAr,
    },
  };
}

export function toStaffBookingRecord(row: StaffBookingRow): StaffBookingRecord {
  return {
    ...toBookingRecord(row),
    memberFirstName: row.user.name,
    memberPhone: row.user.phone,
    gymCommissionRate: row.plan.branch.gym.commissionRate?.toString() ?? null,
  };
}
