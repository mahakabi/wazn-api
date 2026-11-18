import {
  type BookingRecord,
  type Confirmation,
  type NewBooking,
  type StaffBookingRecord,
} from '../booking-record';

export type CreateBookingResult =
  { readonly created: BookingRecord } | { readonly codeTaken: true };

export interface BookingRepository {
  /** Reports a code collision instead of throwing, so the caller can retry with a new code. */
  create(booking: NewBooking): Promise<CreateBookingResult>;
  findActive(userId: string, planId: string, now: Date): Promise<BookingRecord | null>;
  listForUser(userId: string): Promise<BookingRecord[]>;
  findForUser(bookingId: string, userId: string): Promise<BookingRecord | null>;
  findByCode(code: string): Promise<StaffBookingRecord | null>;
  /** Only an ISSUED, unexpired booking can change; returns false otherwise (lost race / expired). */
  cancel(bookingId: string, now: Date): Promise<boolean>;
  confirm(confirmation: Confirmation): Promise<boolean>;
  /** Marks ISSUED bookings past their expiry as EXPIRED; returns how many. */
  expireOverdue(now: Date): Promise<number>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
