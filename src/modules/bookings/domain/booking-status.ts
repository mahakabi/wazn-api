export type BookingStatus = 'ISSUED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  'ISSUED',
  'CONFIRMED',
  'EXPIRED',
  'CANCELLED',
];

/**
 * The expiry job runs periodically, so an ISSUED booking can be past its expiry for a few
 * minutes. Every read and rule uses this instead of the stored status.
 */
export function effectiveStatus(
  booking: { readonly status: BookingStatus; readonly expiresAt: Date },
  now: Date,
): BookingStatus {
  return booking.status === 'ISSUED' && booking.expiresAt.getTime() <= now.getTime()
    ? 'EXPIRED'
    : booking.status;
}
