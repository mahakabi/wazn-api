import { InvalidBookingCodeError } from './errors/invalid-booking-code.error';

/** Uppercase letters and digits without look-alikes: no 0/O and no 1/I. */
export const BOOKING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const BOOKING_CODE_LENGTH = 4;
const PREFIX = 'WZ-';
const SHAPE = new RegExp(`^WZ-[${BOOKING_CODE_ALPHABET}]{${BOOKING_CODE_LENGTH}}$`);

/** `WZ-XXXX`, the code a member shows at the front desk (also the QR content). */
export class BookingCode {
  private constructor(readonly value: string) {}

  /** Lenient for typing at the desk: trims, upper-cases, and accepts it without "WZ-". */
  static parse(raw: string): BookingCode {
    const compact = raw.trim().toUpperCase().replace(/\s+/g, '');
    const withPrefix = compact.startsWith(PREFIX)
      ? compact
      : `${PREFIX}${compact.replace(/^WZ/, '')}`;
    if (!SHAPE.test(withPrefix)) {
      throw new InvalidBookingCodeError();
    }
    return new BookingCode(withPrefix);
  }

  static fromSuffix(suffix: string): BookingCode {
    return BookingCode.parse(`${PREFIX}${suffix}`);
  }
}
