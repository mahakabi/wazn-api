import { type BookingStatus } from './booking-status';

export interface BookingPlace {
  readonly branchId: string;
  readonly district: string;
  readonly gymId: string;
  readonly gymNameEn: string;
  readonly gymNameAr: string;
}

export interface BookingRecord {
  readonly id: string;
  readonly code: string;
  readonly userId: string;
  readonly planId: string;
  readonly planMonths: number;
  readonly offerId: string | null;
  readonly lockedPrice: number;
  readonly status: BookingStatus;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly confirmedAt: Date | null;
  readonly place: BookingPlace;
}

/** What the front desk needs: the booking, who it is for, and how to charge commission. */
export interface StaffBookingRecord extends BookingRecord {
  readonly memberFirstName: string | null;
  readonly memberPhone: string | null;
  /** Gym override; null means use the default setting. */
  readonly gymCommissionRate: string | null;
}

export interface NewBooking {
  readonly code: string;
  readonly userId: string;
  readonly planId: string;
  readonly offerId: string | null;
  readonly lockedPrice: number;
  readonly expiresAt: Date;
}

export interface Confirmation {
  readonly bookingId: string;
  readonly staffId: string;
  readonly commission: string;
  readonly at: Date;
}
