import { type BookingStatus } from './booking-status';

export interface BookingPlaceView {
  readonly branchId: string;
  readonly district: string;
  readonly gymNameEn: string;
  readonly gymNameAr: string;
}

/** What the member sees (Code screen, Account → Bookings). */
export interface MemberBookingView {
  readonly id: string;
  readonly code: string;
  /** Content for the QR image; the front desk scanner fills the code field with it. */
  readonly qrPayload: string;
  readonly status: BookingStatus;
  readonly lockedPrice: number;
  readonly offerApplied: boolean;
  readonly planId: string;
  readonly planMonths: number;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly confirmedAt: Date | null;
  readonly place: BookingPlaceView;
}

/** What the front desk sees after entering a code. Phone is masked (PDPL). */
export interface StaffBookingView {
  readonly id: string;
  readonly code: string;
  readonly status: BookingStatus;
  readonly lockedPrice: number;
  readonly planMonths: number;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly confirmedAt: Date | null;
  readonly memberFirstName: string | null;
  readonly memberMaskedPhone: string | null;
  readonly place: BookingPlaceView;
}
